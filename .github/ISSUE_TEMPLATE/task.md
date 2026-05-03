---
name: Task
about: Create a development task for the project
title: "[TASK] "
labels: task
assignees: ""
---

## Objective
Clearly describe the feature to build.

---

## Allowed Files
List ONLY the files or folders that may be modified.

Example:
contracts/
test/

---

## Required Output
Describe what must be delivered.

Example:
- mintToken()
- listToken()
- buyToken()

---

## Shared API Rules
Do not rename:
- mintToken
- listToken
- buyToken
- cancelListing

---

## Acceptance Criteria
- code compiles
- tests pass
- no unrelated files changed

---

## AI Prompt for Cursor
Paste this into Cursor:

Implement ONLY this issue.
Modify ONLY the allowed files.
Do NOT change files outside your ownership.
Preserve all existing function names.
Keep code compatible with the project README.