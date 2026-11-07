---
title: "Let there be dark"
summary: "Three ways to install Kogen, and why I use it through an agent interface."
author: "Almir Sarajčić"
status: "published"
publishedAt: "2026-11-07T19:11:51Z"
---
It's about time I showed how to install and use Kogen properly. I haven't been mysterious intentionally. I've just been too focused on making it more stable, so onboarding never made it into the queue of my software factory (I just had to put that term in here).

So, here we are. We've set up three installation methods.

- For naïve people, [curl and Homebrew](/get-started/#install).
- For masochists, [building from source](https://github.com/KogenAI/kogen#install).

Your agent can handle any of the three, so pick whichever you prefer. The [getting-started page](/get-started/) has the commands. You can give it to an agent with command-line access and ask it to set up Kogen in your repository.

While Kogen can be used from the command line, it's intended to be used through agent interfaces. At least, that's how I use it.

My part is shaping the feature with my agent, working out how it should behave and what needs checking. That becomes an Intent I approve before Kogen starts the Build. From there, Kogen implements the change, runs the checks, gets an independent review and repairs problems before making the commit. If it can't get through those checks, the Build stops.

You can include it in your workflows. I didn't want to create yet another TUI or GUI for agent orchestration when there are plenty of options out there. I use the ChatGPT desktop app for most of my interactions with the models. I'm basic like that.

You can use it as part of your own software factory, Michelin kitchen, mom's basement, or you can wait until I reveal my own workflow. More on that later.
