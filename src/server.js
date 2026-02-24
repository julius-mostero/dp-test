'use strict';

const crypto = require('crypto');
const { execFile } = require('child_process');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

app.set('trust proxy', 1)

const PORT = process.env.PORT || 3000;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';
const MERGE_BRANCHES = ['qa', 'dev', 'main'];
const SCRIPT_PATH = path.resolve(__dirname, '..', 'scripts', 'on-merge.sh');

/**
 * Verify the GitHub webhook HMAC-SHA256 signature.
 * Returns true when the signature matches or no secret is configured.
 */
function verifySignature(rawBody, signature) {
  if (!WEBHOOK_SECRET) {
    return true; // No secret configured — skip verification
  }
  if (!signature) {
    return false;
  }
  const expected = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Capture the raw request body for signature verification before JSON parsing.
app.use(express.raw({ type: 'application/json' }));

// Rate-limit the webhook endpoint: max 60 requests per minute per IP.
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.post('/webhook', webhookLimiter, (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const rawBody = req.body;

  if (!verifySignature(rawBody, signature)) {
    console.warn('Webhook signature verification failed.');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const event = req.headers['x-github-event'];

  // Only handle pull_request events that were merged into a watched branch.
  if (
    event === 'pull_request' &&
    payload.action === 'closed' &&
    payload.pull_request?.merged === true &&
    MERGE_BRANCHES.includes(payload.pull_request?.base?.ref)
  ) {
    const branch = payload.pull_request.base.ref;
    const prNumber = payload.pull_request.number;
    const prTitle = payload.pull_request.title;
    const mergedBy = payload.pull_request.merged_by?.login || 'unknown';

    console.log(`Merge detected: PR #${prNumber} "${prTitle}" → ${branch} by ${mergedBy}`);

    const env = {
      ...process.env,
      BRANCH: branch,
      PR_NUMBER: String(prNumber),
      PR_TITLE: prTitle,
      MERGED_BY: mergedBy,
    };

    // Fire-and-forget: the script runs asynchronously so GitHub receives an
    // immediate 200 response. Check server logs for script output or errors.
    execFile('bash', [SCRIPT_PATH], { env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Script error: ${error.message}`);
        return;
      }
      if (stdout) console.log(`Script stdout:\n${stdout}`);
      if (stderr) console.error(`Script stderr:\n${stderr}`);
    });

    return res.status(200).json({ message: `Merge detected on ${branch}, script triggered.` });
  }

  // Acknowledge all other events without action.
  return res.status(200).json({ message: 'Event received, no action taken.' });
});

const server = app.listen(PORT, () => {
  console.log(`Webhook server listening on port ${PORT}`);
});

module.exports = { app, server };
