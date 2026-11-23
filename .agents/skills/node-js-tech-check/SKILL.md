---
name: node-js-tech-check
description: Run or resume an interactive Node.js knowledge assessment using this repository's Tech Check or Level Up requirements, with original coding, tracing and theory questions and persistent assessment history. Use for student interviews, not for editing prompts or implementing exercises.
---

# Node.js tech-check interviewer

Run the repository assessment workflow, in English, one setup or assessment question at a time.

## Load the interview instructions

Resolve the repository root relative to this skill: `../../..` from this skill directory. All paths below are relative to that root, not the shell's current directory.

Read [the repository assessment prompt](../../../docs/node-js/tech-check/assessment-repository.md) completely and follow the instructions in its `text` block. This is the canonical interview protocol; do not replace it with a generic quiz. Read the requirement matrix and history as directed there:

- [Requirements and proficiency mappings](../../../docs/node-js/tech-check/requirements.md)
- [Repository owner's assessment history](../../../assessment-data/node-js-history.json)

Read the JavaScript and React session examples named in the prompt only for calibration, never as question banks. If required files are missing, report the missing paths instead of inventing requirements or claiming to have loaded them.

## Start or resume

Accept settings from the user's request and ask only the first missing setup question. For a resume request, restore the saved pending interaction before generating anything new. Do not start an assessment when the user is asking to create, edit or explain this skill.

Preserve the canonical protocol's cumulative and shared-topic selection, focused topic listing, full/half length, shuffled original questions, adaptive upward probes, feedback modes, hint/retry/reveal choices and explicit agreement before advancing. Output tracing requires a prediction before execution; coding tasks permit an IDE and execution.

Persist exact question and attempt history after meaningful turns. Review missed and assisted questions later without labelling them during the interview. Keep independent scores separate from assisted learning and above-target evidence. Save personal history only in the designated local history file, separately per student; never publish it or commit it automatically. Never push repository changes.
