---
title: Codex finished with failing checks
summary: Codex can exhaust its attempts to fix a failing check while the surrounding codex exec process still exits successfully.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-15
---

Run it from a script. Tell it to change something, give it a check, and make that check fail. Give it the failure twice and tell it to stop if it fails a third time. That’s roughly the setup we had for this little test in Kogen. Did the script get an error from Codex? Nope. It got a zero.

I can see why that’s the exit code. We wanted Codex to stop there, and it stopped. The trouble comes if you put an `if` in the script and use the exit code to say the code is good. We did a second run, also with three attempts, where the last check passed. Zero there too. The program running Codex has to get one more bit of information from somewhere or it has no way to distinguish the two runs.

So what would I put in the `if`? The result of the check. We already have that in Kogen, so I can leave the exit code alone and use the result we saved when the Build goes to accept the change. This was on Codex CLI 0.154.0, by the way. I just wanted to see what came back for each of those two runs.

[See the probe and its recorded results](https://github.com/KogenAI/kogen/blob/aef8b98a1c9356516f914bd649dd6ecdae956f4d/.kogen/intents/complete/unify-verification/evidence/native-stop-findings.md)
