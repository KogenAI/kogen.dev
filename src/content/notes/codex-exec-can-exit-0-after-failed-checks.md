---
title: codex exec can exit 0 after failed checks
summary: Codex can exhaust its attempts to fix a failing check while the surrounding codex exec process still exits successfully.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-15
---

`codex exec` is the non-interactive way to run Codex from a script. Give it a
task, wait for it to finish, then inspect the process exit code like you would
with any other command.

Kogen uses it to run a coding agent that changes code and responds to automated
checks. When a check fails, Codex gets the failure, tries to fix the problem and
runs through the cycle again. After enough failures, it reaches the retry limit
and stops.

What exit code would you expect from that process?

The surrounding `codex exec` process exits with code 0.

That is the same exit code it produces when the checks eventually pass. If
another program uses that code to decide whether the work succeeded, it cannot
tell the difference between a verified change and an agent that stopped after
exhausting its attempts.

Kogen tested these two cases side by side.

In the first run, the check failed three times. Codex was allowed to continue
after the first two failures, then told to stop after the third.

In the second run, the check failed twice and passed on the third attempt.

Both runs made three attempts. Both completed the turn normally. Both exited
with code 0.

The only reliable difference was the verification decision returned by the
check itself: one run had exhausted its attempts, while the other had passed.

The failed check and `codex exec` are two different layers. The check tells
Kogen whether the code passed. The exit code tells us that Codex completed its
turn without the CLI itself crashing. It does not tell us that the code passed
verification.

Kogen therefore records the verification result separately and checks that
result before accepting a Build. If you automate `codex exec` with your own test
or review loop, you need the same distinction: a completed Codex turn and exit
code 0 are not proof that the inner work passed.

This was a focused probe using Codex CLI 0.154.0 and simple pass-or-fail
commands. It establishes this specific behavior, but it does not measure how
often agents exhaust their attempts during real development work.

[See the probe and its recorded results](https://github.com/KogenAI/kogen/blob/aef8b98a1c9356516f914bd649dd6ecdae956f4d/.kogen/intents/complete/unify-verification/evidence/native-stop-findings.md)
