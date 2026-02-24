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
REPOSITORY="${REPOSITORY:-unknown}"

echo "============================================"
echo "  Merge detected on branch : ${BRANCH}"
echo "  REPOSITORY               : ${REPOSITORY}"
echo "  PR #${PR_NUMBER}         : ${PR_TITLE}"
echo "  Merged by                : ${MERGED_BY}"
echo "============================================"

case "${REPOSITORY}" in
  dp-test)
    echo "Running post-merge steps for repository: dp-test..."
    case "${BRANCH}" in
      main)
        echo "  [dp-test] Running production deploy..."
        ;;
      qa)
        echo "  [dp-test] Running QA deploy..."
        ;;
      dev)
        echo "  [dp-test] Running DEV deploy..."
        ;;
      *)
        echo "  No specific steps defined for branch: ${BRANCH}"
        ;;
    esac
    ;;
  budget-app)
    echo "Running post-merge steps for repository: budget-app..."
    case "${BRANCH}" in
      main)
        echo "  [budget-app] Running production deploy..."
        ;;
      qa)
        echo "  [budget-app] Running QA deploy..."
        ;;
      dev)
        echo "  [budget-app] Running DEV deploy..."
        ;;
      *)
        echo "  No specific steps defined for branch: ${BRANCH}"
        ;;
    esac
    ;;
  *)
    echo "No specific steps defined for repository: ${REPOSITORY}"
    ;;
esac

echo "Done."
