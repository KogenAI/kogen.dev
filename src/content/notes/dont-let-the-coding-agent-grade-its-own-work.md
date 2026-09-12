---
title: Don’t let the coding agent grade its own work
summary: Why Kogen lets the Developer run focused tests but reserves final verification for automated machinery.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-12
---
When a coding agent finishes a change, it is tempting to ask that same agent to
run the final checks and report whether the work passed.

Kogen deliberately separates those responsibilities.

The Developer can still run focused tests while implementing a feature. That is
how it reproduces failures, checks repairs, and investigates unexpected results.
But it cannot run the final verification that determines whether its work can
proceed to Review.

Those checks belong to Kogen’s automated machinery. Their results are recorded
against the exact code and Developer session being assessed. Review then belongs
to a fresh agent.

We enforce this separation at runtime for the commands Kogen uses as final
verification. If the Developer tries to run one, it is blocked before execution
and directed toward focused tests instead. This is a bounded ownership mechanism,
not a general-purpose shell sandbox.

The principle is simple: let a coding agent use tests to do its job, but do not
let its own success report become the evidence that the job is finished.

[See the pre-execution probe](https://github.com/KogenAI/kogen/blob/main/.kogen/intents/complete/automated-verification-ownership/evidence/preexecution-probe.md)
