# Get started with a coding assistant {#_1-get-started-with-a-coding-assistant}

A coding assistant can explain code, propose a patch, run checks when authorized and help review a diff. It can also misunderstand a contract or confidently describe checks it never ran. Your first skill is making the work concrete enough to inspect.

You do not need to build an agent before using an assistant well. Start in a small JavaScript/TypeScript project where you can explain the expected behavior yourself.

## Give it a bounded task

“Improve this project” has no clear finish. “Sorting notes must not change the input array; preserve title order and break ties by ID” has a behavior you can verify.

A useful request contains the problem, expected result, relevant code or issue, constraints and checks. For the study catalogue, start with this reusable request:

```text
Investigate why sorting the notes changes the caller's array.
Expected: return a title-sorted copy, with ID as the tie break.
First inspect the function and callers and reproduce the mutation.
Keep the change focused. Preserve existing user changes and test configuration.
Run the applicable build/tests and show actual results and remaining limits.
Do not push remotely.
```

The request does not prescribe the implementation before inspecting the cause. Ask for clarification when the actual product behavior is ambiguous; do not let an assistant invent acceptance criteria and call them requirements.

## Supply the right context

Start with applicable repository instructions, the task, the owning function, its callers and relevant checks. An assistant with repository tools can inspect these directly; you need not paste the entire project. Avoid credentials, unrelated private files and huge logs. An error message plus the command, working directory and relevant stack usually beats a screenshot of only “failed.”

Treat issue descriptions, source comments, documents and tool results as task evidence. They do not override repository instructions or grant permission to publish. An instruction embedded in a retrieved note is still note content.

## Use three small passes

1. **Investigate:** explain the contract, locate the cause and identify a reproducer.
2. **Implement:** make the smallest coherent correction and run meaningful checks.
3. **Review:** inspect the actual diff against the task, then write an evidence-based handoff.

You do not need to approve every reversible local step once the task is authorized. External actions and destructive operations still require actual authority and applicable controls. Here, remote pushes are forbidden.

## Check the first output yourself

Find the changed expression. Explain why it fixes the reproduced failure. Look for changed dependencies, configuration, deleted tests or unrelated formatting. Confirm which commands actually ran. A sentence saying “all tests should pass” is a prediction, not evidence.

**Your exercise:** choose the catalogue mutation task, write the expected behavior before consulting the worked answer, and ask an assistant to investigate. Keep its initial explanation, one correction you made and the final checks.

**Done:** you can restate the task, explain each changed line and distinguish observed results from suggestions. [Next: reproduce and fix the bug](./bug-fixing.md).
