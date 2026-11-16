---
title: Make no mistakes
summary: Preventable mistakes enter an agent-led Build through ambiguity. Make the decisions explicit enough to inspect and check.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-19T20:25:23Z
---
I want to change how a failed build looks. What does “keep the existing behavior” mean here? For me, I still need to find that build in history and retry it. I don't care if the button moves. If I want the agent to leave the rest alone, I have to say where the screen ends and what it can change.

I can decide how to check it while I'm thinking about the feature. In this case I’d make a build fail, find it in history and retry it. If I leave it at “run the tests,” the agent can run every test in the project without finding out whether retry works.

I shape the work in Kogen before I ask it to build. I make the product and UX choices and look at the Intent. It says what should change, what should stay, where the work belongs and how we’re going to check it. Once I approve it, Kogen builds, runs those checks, gets a review and commits the change. “Make no mistakes” can mean a lot of things. I know what I mean about that button now.
