---
title: Markdown for agents. HTML for humans.
summary: The source stays Markdown. Astro templates turn it into a website, so I don't hand-write HTML on every report.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-14
---
In May, Thariq wrote about the unreasonable effectiveness of HTML for Claude Code:

<aside class="tweet-card" aria-label="Post by Thariq on X">
  <div class="tweet-card-author">
    <img src="/notes/markdown-for-agents-html-for-humans/thariq-avatar.jpg" alt="" width="48" height="48" decoding="async" />
    <a href="https://x.com/trq212"><strong>Thariq</strong><span>@trq212</span></a>
    <a class="tweet-card-platform" href="https://x.com/trq212/status/2052809885763747935" aria-label="View original post on X">𝕏</a>
  </div>
  <blockquote><p>Using Claude Code: The Unreasonable Effectiveness of HTML</p></blockquote>
  <a class="tweet-card-date" href="https://x.com/trq212/status/2052809885763747935"><time datetime="2026-05-08T17:56:30.786Z">8:56 PM · May 8, 2026 EAT</time></a>
  <div class="tweet-card-source"><a href="https://x.com/trq212/status/2052809885763747935">Read on X <span aria-hidden="true">↗</span></a></div>
</aside>

I wasn't convinced. I quoted it the next day:

<aside class="tweet-card" aria-label="Post by Almir Sarajčić on X">
  <div class="tweet-card-author">
    <img src="/notes/you-dont-need-astra/almir-avatar.jpg" alt="" width="48" height="48" decoding="async" />
    <a href="https://x.com/ultrathinktrash"><strong>Almir Sarajčić</strong><span>@ultrathinktrash</span></a>
    <a class="tweet-card-platform" href="https://x.com/ultrathinktrash/status/2053035151601352872" aria-label="View original post on X">𝕏</a>
  </div>
  <blockquote><p>Unlimited usage must be nice.</p><p>I’ll keep using Markdown with my limited Claude subscription.</p><p>We solved this a long time ago:<br>- Markdown exports to HTML<br>- HTML works within Markdown</p></blockquote>
  <a class="tweet-card-date" href="https://x.com/ultrathinktrash/status/2053035151601352872"><time datetime="2026-05-09T08:51:38.347Z">11:51 AM · May 9, 2026 EAT</time></a>
  <div class="tweet-card-source"><a href="https://x.com/ultrathinktrash/status/2053035151601352872">Read on X <span aria-hidden="true">↗</span></a></div>
</aside>

To me, it looked like Thariq was either trying to sell us more of those Anthropic tokens or had gotten spoiled by unlimited usage. It just looked like a waste.

By August I'd reversed course:

<aside class="tweet-card" aria-label="Post by Almir Sarajčić on X">
  <div class="tweet-card-author">
    <img src="/notes/you-dont-need-astra/almir-avatar.jpg" alt="" width="48" height="48" decoding="async" />
    <a href="https://x.com/ultrathinktrash"><strong>Almir Sarajčić</strong><span>@ultrathinktrash</span></a>
    <a class="tweet-card-platform" href="https://x.com/ultrathinktrash/status/2094401942801788979" aria-label="View original post on X">𝕏</a>
  </div>
  <blockquote><p>Oh, how wrong I was about HTML vs Markdown for output.</p><p>Now I tell Codex and Claude Code: no terminal output. Just give me HTML reports as artifacts/sites.</p></blockquote>
  <a class="tweet-card-date" href="https://x.com/ultrathinktrash/status/2094401942801788979"><time datetime="2026-08-31T12:28:29.927Z">3:28 PM · Aug 31, 2026 EAT</time></a>
  <div class="tweet-card-source"><a href="https://x.com/ultrathinktrash/status/2094401942801788979">Read on X <span aria-hidden="true">↗</span></a></div>
</aside>

It's September, years have passed in the AI era, and now I'm older and wiser. I think I've struck a balance between the two: agents write Markdown files that Astro then renders. They don't continuously spend tokens writing all those repetitive HTML tags. They do that work once in the template, then later just write the content.

Of course, the nice-looking images and diagrams Thariq mentioned still need to be generated. The template only removes the repetitive presentation work.

The agent-facing layer is Markdown: cheap to generate, easy to diff, easy to edit by hand afterward. The human-facing layer is HTML: rendered by the template, not re-derived by an agent on every run. For these reports, HTML is the delivery format, not something I ask an agent to hand-author each time.

I still wouldn't ask an agent to write raw HTML for a report it's about to hand me. I'd ask it to write Markdown, and let a template already built for that job turn it into something worth reading.
