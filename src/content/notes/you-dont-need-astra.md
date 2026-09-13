---
title: You don’t need Astra
summary: I tried cheaper models on the same Kogen build. They finished the job too.
author: Almir Sarajčić
status: published
publishedAt: 2026-09-13
---
Back in July I wrote [“You don’t need Fable.”](https://x.com/ultrathinktrash/status/2073527099952881756)
Now I’m writing pretty much the same thing about Astra.

I get wanting to use the latest, greatest model. But if you give it a huge scope,
let it fill the context with everything it comes across, then run out of usage
before it finishes, I’d look at how you organized the work first.

Astra is great. It is not THAT great.

While building Kogen, I tried the same complete build with three different model
settings: Astra at low effort, Sol at low effort, and Terra at medium effort.
Each setting applied to the main agent, the Developer and the Reviewer, so this
included writing the code, checking it, reviewing it and fixing what came back
from review.

All three passed. Sol took 443.5 seconds, Astra took 503.1, and Terra took 544.9.
Terra’s Reviewer was also the only one to catch an additional real defect, which
its Developer fixed before finishing. So the slowest run did get me something
for the extra time.

Of course, one run per model won’t tell me which one is better in general. But
Sol and Terra completed the job, and that’s enough for me to keep using them for
this kind of work. I don’t need Astra for a task they can already do.

There’s another comparison in the repo where Sol and Astra got the same focused
expert task, both at medium effort. Both passed there too. Astra gave a more
precise answer in one part, but took 103.9 seconds to Sol’s 80.7. The estimated
API cost was about $0.54 versus $0.23, including the coordinating agent. Those
are estimates using the recorded usage and the API rates at the time, not
charges to my subscription or a measurement of how much allowance either used.

I’d pay the difference when that extra precision matters. For the task I gave
them, Sol’s answer was sufficient.

The part I’d spend more time on is splitting up the work. Give an agent a clear
job and the context it needs to do it. If it needs to investigate three
independent things, it can delegate those and get the findings back instead of
pulling every file and search result into its own context. The same goes for
implementation when the pieces can be worked on independently.

I’d keep the main agent on coordination, decisions and putting the results
together. Smaller models can handle the clear, limited jobs, and a fresh agent
can review the code. Then use Astra where the work actually needs it. Handing
one agent the whole project and expecting it to work everything out is a lot to
ask, even with the best model selected.

Mind you, delegation has overhead too. I wouldn’t split a small change between
five agents just because I can. The point is to give each one enough work to be
useful without making it carry the whole project around.

You don’t need Astra for all of this. You need to organize the work better.

Results: [full build comparison](https://github.com/KogenAI/kogen/blob/main/.kogen/intents/complete/configure-models-and-delegation/evidence/historical/model-lifecycle-probe-v2/results.md),
[expert and helper comparisons](https://github.com/KogenAI/kogen/blob/main/.kogen/intents/complete/configure-models-and-delegation/evidence/historical/helper-candidates-v2/results.md).
