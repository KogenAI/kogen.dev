---
title: "Rolling back the ChatGPT schema"
summary: "I rolled back ChatGPT desktop, but the older version couldn’t read some conversations. Here’s what we changed."
author: "Almir Sarajčić"
status: "published"
publishedAt: "2026-11-27"
---
Tired of ChatGPT bugs, I got on a mission to fix it once and for all. The source is not open, but that didn’t stop me. In [Fine, I’ll Fix ChatGPT Myself](/notes/2026-11-26/fine-i-ll-fix-chatgpt-myself/), I wrote about patching the desktop app. That came with a workaround for communication between chats.

I depend on old conversations, and I use the desktop app because I can organize them well. So I wanted a better solution for getting chats to communicate: going back to the older version that worked.

I’d tried that already, but some of my existing conversations wouldn’t open after the rollback. A migration had changed their format. I figured I could fix that too. Hear me out.

[![ChatGPT desktop showing “Failed to resume chat” and “missing field `action`”.](/notes/getting-my-chats-back/chat-resume-error.png)](/notes/getting-my-chats-back/chat-resume-error.png)

## What changed

I was going from ChatGPT desktop **26.1120.50957** back to **26.1111.71025**. We compared the schemas bundled with both: the newer saved message had display metadata without the `action` field the old version required.

We added the missing field to a copy of a conversation. It opened in the old app and could exchange messages.

After backing up the available records while the app was running, we converted the matching conversations and history entries. A previously failing chat opened afterward.

## Keeping the fixes

The desktop patch and this rollback got me thinking about a repair kit for AI tools. I want to collect fixes alongside the problems so I can patch ChatGPT again when an update overwrites my changes. I’m sure I’ll be fixing more bugs, so I need a systematic approach. Maybe it will teach people at OpenAI how to approach software development.

Newer versions probably won’t have the code in the exact same place, so regular Git patches might not work. I went with agent recipes instead.

Anyway, the repo is available at [harness-tweaks](https://github.com/almirsarajcic/harness-tweaks).
