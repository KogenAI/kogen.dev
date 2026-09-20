---
title: I don't want AGENTS.md
summary: One repository-wide instruction file cannot fit agents with different jobs, and sharing its filename does not standardize how tools interpret it.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-20
---

Claude Code 2.1.277 added support for `AGENTS.md` this week. Thariq announced it
on X:

<aside class="tweet-card" aria-label="Post by Thariq on X">
  <div class="tweet-card-author">
    <img src="/notes/markdown-for-agents-html-for-humans/thariq-avatar.jpg" alt="" width="48" height="48" decoding="async" />
    <a href="https://x.com/trq212"><strong>Thariq</strong><span>@trq212</span></a>
    <a class="tweet-card-platform" href="https://x.com/trq212/status/2101009392611278961" aria-label="View original post on X">𝕏</a>
  </div>
  <blockquote><p>We're adding support for AGENTS.md to Claude Code.</p><p>Starting today in version 2.1.277, if there is no CLAUDE.md in a folder, Claude will check for and use AGENTS.md.</p><p>You can toggle this behavior in /config.</p></blockquote>
  <a class="tweet-card-date" href="https://x.com/trq212/status/2101009392611278961"><time datetime="2026-09-18T18:04:00Z">9:04 PM · Sep 18, 2026 EAT</time></a>
  <div class="tweet-card-source"><a href="https://x.com/trq212/status/2101009392611278961">Read on X <span aria-hidden="true">↗</span></a></div>
</aside>

If a project has no `CLAUDE.md`, Claude Code can now read the same project
instructions as other coding agents.

I understand why people wanted this. I am against `AGENTS.md` altogether.

The problem is not that the file has the wrong name or that every coding agent
invented its own version. The problem is treating one repository-wide set of
instructions as applicable to every agent that works in the repository.

Different agents have different jobs.

A planning agent should question the request, investigate the software and find
the decisions that still need to be made. An implementation agent should work
from the agreed requirements and change the code. A reviewing agent should
remain independent from the implementation agent's reasoning and look for what
it missed.

Those agents may work in the same repository. They should not receive the same
instructions.

A rule can be correct for one of them and harmful to another. Tell every agent
how to build and the reviewer inherits the builder's framing. Tell every agent
to remain read-only and the builder cannot do its job. Put all the exceptions in
the same file and every agent has to work out which paragraphs apply to it.

That is why Kogen does not create project `AGENTS.md` files. Each role gets the
instructions, inputs and authority that belong to that role. Rules that must
hold for everyone belong in mechanisms that can enforce them, not in a paragraph
we hope every model interprets correctly.

Claude Code's new support also shows how quickly a supposedly shared file grows
another layer of behavior to understand.

By default, Claude Code reads `AGENTS.md` only when it does not find a project
`CLAUDE.md` or `CLAUDE.local.md`. A setting can make it read both. Some sessions
cannot load `AGENTS.md` directly. When Claude Code reads the file directly, it
does not list it with the memory files in `/context`, and its instruction-loaded
hooks do not fire.

Then there are file references. I asked about this under the announcement:

<aside class="tweet-card" aria-label="Post by Almir Sarajčić on X">
  <div class="tweet-card-author">
    <img src="/notes/you-dont-need-astra/almir-avatar.jpg" alt="" width="48" height="48" decoding="async" />
    <a href="https://x.com/ultrathinktrash"><strong>Almir Sarajčić</strong><span>@ultrathinktrash</span></a>
    <a class="tweet-card-platform" href="https://x.com/ultrathinktrash/status/2101036988425974195" aria-label="View original post on X">𝕏</a>
  </div>
  <blockquote><p>What does this mean for @ file references? Are you gradually going to move away from them, or are the file references going to be supported in AGENTS.md too?</p></blockquote>
  <a class="tweet-card-date" href="https://x.com/ultrathinktrash/status/2101036988425974195"><time datetime="2026-09-18T19:53:00Z">10:53 PM · Sep 18, 2026 EAT</time></a>
  <div class="tweet-card-source"><a href="https://x.com/ultrathinktrash/status/2101036988425974195">Read on X <span aria-hidden="true">↗</span></a></div>
</aside>

I got no answer. However, Claude Code's current documentation now says that
`@path` imports inside `AGENTS.md` are expanded.

Other coding agents do not necessarily treat those references the same way.
`AGENTS.md` standardizes a filename and leaves each harness to define how it
discovers, combines and interprets the files. Some harnesses expand `@path` as an
import. Others document only the Markdown file itself and their own directory
precedence. The same `AGENTS.md` can therefore mean different things depending
on which agent reads it. That is not much of a standard.

This is not an argument that Claude Code implemented the feature badly. It is
what happens when implicit discovery becomes part of the agent's input. Now the
result depends on which instruction files exist above the working directory,
which mode is selected, which provider runs the session, which version is
installed, and whether another file imported the same instructions.

Giving the file a standard name did not make its behavior standard. It still
depends on which coding agent reads it.

Project context matters. Agents need to understand the software they are working
on. I just don't think a globally loaded instruction file is the right way to
give it to them.

There are better ways to deal with project context, but that is a story for
another time.

[Claude Code 2.1.277 release notes](https://github.com/anthropics/claude-code/releases/tag/v2.1.277)

[Claude Code documentation for `AGENTS.md` and project memory](https://code.claude.com/docs/en/memory#agents-md)
