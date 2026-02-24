#!/usr/bin/env bash
# scripts/on-merge.sh
# Executed by the webhook server whenever a pull request is merged into
# the qa, dev, or main branch.
#
# Environment variables provided by the server:
#   BRANCH     - target branch (qa | dev | main)
#   PR_NUMBER  - pull request number
#   PR_TITLE   - pull request title
#   MERGED_BY  - GitHub login of the user who merged the PR

set -euo pipefail

BRANCH="${BRANCH:-unknown}"
PR_NUMBER="${PR_NUMBER:-unknown}"
PR_TITLE="${PR_TITLE:-unknown}"
MERGED_BY="${MERGED_BY:-unknown}"

echo "============================================"
echo "  Merge detected on branch : ${BRANCH}"
echo "  PR #${PR_NUMBER}         : ${PR_TITLE}"
echo "  Merged by                : ${MERGED_BY}"
echo "============================================"

case "${BRANCH}" in
  main)
    echo "Running post-merge steps for MAIN (production)..."
    ;;
  qa)
    echo "Running post-merge steps for QA..."
    ;;
  dev)
    echo "Running post-merge steps for DEV..."
    ;;
  *)
    echo "No specific steps defined for branch: ${BRANCH}"
    ;;
esac

echo "Done."
