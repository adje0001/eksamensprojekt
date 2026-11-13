---
name: pr
description: Open a pull request with the team template
disable-model-invocation: true
---
Open a PR for the current branch with `gh pr create`. Use this body:

## User story
<story and MoSCoW priority, link the GitHub Projects issue>

## What changed
<short list>

## How it is tested
<tests added or updated, incl. E2E if relevant>

## Course relevance
<DE / DB2 / Fullstack: which exam requirement this supports>

## AI use
<what Claude did, what a human changed or rejected>

Then show the PR URL. Do not merge. Merging needs a review from a group member and green CI.
