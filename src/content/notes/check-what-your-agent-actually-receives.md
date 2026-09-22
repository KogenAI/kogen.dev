---
title: Check what your agent actually receives
summary: In Optimum Codegen, 31 rules we had written for the build agents reached them as one. Here is what broke the delivery, why nothing caught it, and how to check your own setup.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-22
---

Before Kogen there was Optimum Codegen. Over about a year we wrote rules for its
agents: how to handle failures, what to log, when to stop. In August, while
rewriting Codegen's build loop, we audited something we had never checked
directly: how many of those rules actually reach the model?

Out of 31, one did. The build agents were running on a one-line system prompt
that named their role and asked for a typed result. Everything else we thought
they were following was in files they never saw.

## How the rules got lost

Rules reached an agent in two ways. Most were copied into each agent's installed
definition, which only loads when the agent is started under its role name. A few
were imported at run time from the app's `CLAUDE.md`. Only two rules travelled
both ways, so each path carried rules the other didn't.

The rewritten build loop didn't pass the role name to the dispatch script. The
script had a sensible fallback for calls without a role: skip the agent
definition and append a short system prompt instead. That fallback is where the
one-line prompt came from, and it became the only path anything took. Without a
role name, the script also loaded fewer settings scopes, and it dropped the one
where the agent definitions lived.

The other path had been broken since May. `CLAUDE.md` imported rules from
`@codegen/rules/_core/`, and a Markdown formatter escaped the leading underscore
so it wouldn't be read as emphasis. What got committed was
`@codegen/rules/\_core/`, and that import doesn't resolve.

None of those changes looks wrong on its own, which is part of why they lasted.

## Why nothing caught it

When a code import breaks, the build fails. When an instruction import breaks,
nothing fails. The model just works without that rule, and from the outside that
looks the same as a model ignoring it.

Our documentation didn't help. Two files still described the old way agents were
launched, so anyone reading them had every reason to think the rules were
arriving.

We even had a check on the instruction files, but it compared two of them for
consistency. Since neither one loaded, they were consistent, and the check
passed.

## How to check yours

Put a canary in every instruction source. Add a unique, meaningless string to
each file you believe reaches the model, a different one per file, and then ask
the model to list every canary it can see. If one doesn't come back, that file
didn't arrive, whatever the configuration says. This is how we confirmed the
escaped underscore: the canary in that file never came back.

Print the real command line. Whatever launches your agent should be able to print
the full command it would run without running it. Our dispatch script could do
that. We had added the option for debugging and never used it on the build path,
where it would have shown the role flag missing and the fallback prompt in its
place.

Ask the model for an inventory rather than a promise. If you ask "do you follow
rule X?", it will probably say yes. Ask it to list the heading and first line of
every instruction document in its context instead. The model is reporting on
itself, so treat the answer as a strong signal rather than proof, but it catches
files that loaded as stubs and imports that expanded to nothing.

Check that the agent can do what its instructions ask. "Read `docs/database.md`
before changing the schema" is no use to an agent that has no tool for reading
files. Instructions and tool permissions are usually configured in different
places, often by different people, so check them together.

Once you know what actually arrives, turn that into a test. Assert on what
reaches the model, not on what the configuration files contain, so the next
formatter or refactor can't quietly change it again.

Whether you use `CLAUDE.md`, `AGENTS.md`, agent definitions or plain system
prompts ([I have opinions](/notes/i-dont-want-agents-md/)), the canary check
takes an afternoon. Count what comes back, and trust that number over the files.
