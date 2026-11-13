---
name: feature
description: Build a new feature from a user story using GitHub Flow, acceptance tests first
disable-model-invocation: true
---
Build a feature from a user story. Follow these steps in order and stop to ask if anything is unclear.

1. Ask for the user story if it was not given. Format: "As a <role>, I want <goal>, so that <benefit>." Ask for its MoSCoW priority.
2. Write 3 to 7 acceptance tests in Given/When/Then form. Each must clearly pass or fail. Show them and wait for approval.
3. Create a branch from an up-to-date main: `git checkout main && git pull && git checkout -b feature/<short-name>`.
4. Write the tests first (Jest + Supertest for API, E2E if the story is user-facing). Include a denied-access test for any protected route.
5. Implement the smallest change that makes the tests pass. Follow the rules in CLAUDE.md.
6. If the database changes, follow the /migration skill.
7. Run `npm run lint` and `npm test`. Fix until both are green.
8. Commit with a clear message, then run the reviewer agent on the diff and fix real findings.
9. Push and follow the /pr skill.
10. Summarise for the user: what changed, which tests prove it, anything they should be able to explain at the exam.
