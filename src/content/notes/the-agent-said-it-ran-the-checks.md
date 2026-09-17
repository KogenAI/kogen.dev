---
title: The agent said it ran the checks
summary: A Stop hook makes declared checks part of finishing instead of trusting an agent to report that it ran them.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-17
---

An agent can say the tests passed, list the files it changed, mention a clean
exit, and sound completely confident. None of that makes the check a thing
that actually happened. It is the agent describing what it thinks happened, or
what it thinks it was supposed to do.

"Run the full check before you finish" is a good instruction. It is still an
instruction.

The agent has to remember it, decide it applies, run the right command,
interpret the result correctly, and carry that result into its final answer.
Every part of that chain can fail while the final answer still looks fine.

The practical answer is a Stop hook.

When the agent tries to finish, the hook runs the checks. If they pass, the
turn can settle. If they fail, the agent gets the result and has to keep
working. That does not require a large framework around it. It can be one
project command. It can be tests plus formatting. It can be whatever you would
otherwise ask the agent to remember at the end.

The important part is where it runs. Not in the task description. Not in a
checklist the agent is expected to follow. At the point where the agent is
trying to say it is done.

We found why that boundary matters. [Codex can report that a turn completed and
return exit code 0](https://kogen.dev/notes/2026-09-15/codex-exec-can-exit-0-after-failed-checks/)
even after a Stop path has exhausted its verification allowance. If I only
looked at the final message or the process status, I could call that Build
successful. It was not successful. The hook's recorded result was the
authority.

A Stop hook does not prove the tests are good. It does not prove the tests
cover the right thing. It does not replace review.

It does one narrower job: it makes running the declared checks part of
finishing, instead of trusting the agent to report that it did.

Everything else is prose.
