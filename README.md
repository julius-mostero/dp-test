# dp-test

Node.js server that listens for GitHub webhook events and runs a bash script whenever a pull request is **merged** into the `qa`, `dev`, or `main` branch.

## How it works

1. GitHub sends a `pull_request` webhook event to `POST /webhook`.
2. The server verifies the request signature (HMAC-SHA256) when `WEBHOOK_SECRET` is set.
3. If the PR was merged into `qa`, `dev`, or `main`, the server runs `scripts/on-merge.sh`.

## Setup

```bash
npm install
cp .env.example .env   # fill in your values
npm start
```

## Environment variables

| Variable         | Default | Description                                  |
|------------------|---------|----------------------------------------------|
| `PORT`           | `3000`  | Port the server listens on                   |
| `WEBHOOK_SECRET` | *(none)*| GitHub webhook secret for signature checking |

## GitHub webhook configuration

In your GitHub repository go to **Settings → Webhooks → Add webhook**:

- **Payload URL**: `http://<your-server>:<PORT>/webhook`
- **Content type**: `application/json`
- **Secret**: value of `WEBHOOK_SECRET`
- **Events**: select *Pull requests*

## Customising the merge script

Edit `scripts/on-merge.sh`. The following environment variables are available inside the script:

| Variable    | Description                      |
|-------------|----------------------------------|
| `BRANCH`    | Target branch (`qa`/`dev`/`main`)|
| `PR_NUMBER` | Pull request number              |
| `PR_TITLE`  | Pull request title               |
| `MERGED_BY` | GitHub login of the merger       |

