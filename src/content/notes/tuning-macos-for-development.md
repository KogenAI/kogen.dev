---
title: "Tuning macOS for development"
summary: "What I changed on my Mac after slow Kogen builds led me to Spotlight, fseventsd, XProtect and automatic Xcode updates."
author: "Almir Sarajčić"
status: "published"
publishedAt: "2026-10-30"
updatedAt: "2026-11-03"
---

Git disappeared during a test. I was in the middle of a Kogen build when the App Store started updating Xcode, so that one was fairly easy to explain. I turned off automatic updates in the App Store. I’ll install those updates when I’m done building. I left the security updates in Software Update alone.

## Choose when Xcode updates

For an App Store installation of Xcode:

Open the **App Store** and go to **App Store → Settings** in the menu bar, then uncheck **Automatic Updates**. Once you’re done with your builds, you can install the pending updates from the **Updates** page.

![App Store Settings with Automatic Updates unchecked.](/notes/macos-development/app-store-automatic-updates.png)

You’ll have to update the other App Store apps manually too; the setting applies to all of them. [Here are Apple’s instructions](https://support.apple.com/en-us/102629).

## Keep build output out of Spotlight

The slow builds took a bit longer to figure out. I kept seeing Spotlight’s `mds` and `mds_stores` processes busy when the build wrote files it was about to throw away. I don’t search for those files, so I put my working directories under `.noindex`. Spotlight skips directories with that suffix, although macOS still tracks the file changes inside them.

If I’m setting up a new project, I create a directory for it first.

```sh
mkdir -p ~/work.noindex
```

That takes care of the files inside it. Where did my tools put their caches? If they’re somewhere else, I have to exclude those too.

For an existing directory I can go through **Apple menu → System Settings → Spotlight** and open **Search Privacy…** near the bottom.

![Spotlight settings with the Search Privacy button at the bottom right.](/notes/macos-development/spotlight-settings.png)

I can drag the folders in or use **+** to add them. Once the development directories, dependencies and build output I want out of the index are there, I click **Done**.

![Spotlight's Privacy dialog showing an example list of excluded development and coding-agent folders.](/notes/macos-development/spotlight-exclusions.png)

It might be called Spotlight Privacy on your Mac. [Here’s how Apple describes it](https://support.apple.com/en-ie/guide/mac-help/mchl1bb43b84/27/mac/27).

If you search for source files in Spotlight, leave the source where it is and exclude the build output. One thing to look out for if you use Xcode: Spotlight helps find debug symbols for crash reports. I’d leave those somewhere it can still see them. Those are the `.dSYM` files; [Apple explains how Xcode finds them](https://developer.apple.com/documentation/xcode/locating-a-missing-debug-symbol-file).

## File system events

The other thing I found was `fseventsd`, the macOS process that tracks file changes, using about 49 GiB on a MacBook with 24 GiB of RAM. I had over 35 GiB of swap. I restarted the process and swap went below 1 GiB without a reboot. My runner now checks its memory before a build. I suspect the amount of temporary files we create and delete has something to do with it.

Most of the 49 GiB was compressed memory. The restarted process began at about **4 MiB**. The runner can restart it under memory pressure as well as checking before a build.

If you keep disposable build caches on their own volume, you can turn off saved event logs for that volume with `.fseventsd/no_log`. I haven't tried it on this workload. [Apple's instructions for turning off event logging](https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/FSEvents_ProgGuide/FileSystemEventSecurity/FileSystemEventSecurity.html)

## Check XProtect separately

During Kogen's Go tests, `XProtectService` was one of the busiest processes. I moved the Go checks to Linux for a while. For the jobs I run over SSH on the Mac, I enabled Developer Tools for `sshd-keygen-wrapper`.

Here’s where you can enable it for Terminal or your IDE:

Open **System Settings** from the **Apple menu** and choose **Privacy & Security** in the sidebar. Scroll down the right-hand pane to **Developer Tools**, then find Terminal, your IDE or whichever app launches your development commands. If it’s missing, you can add it with **+**. Enable the switch next to the app.

![Developer Tools in System Settings, with Privacy & Security selected in the sidebar and separate switches for the SSH launcher and Terminal.](/notes/macos-development/developer-tools.png)

You can read about [XProtect here](https://support.apple.com/en-ie/guide/security/sec469d47bd8/web). It’s the malware protection that comes with macOS. According to Apple, the checks happen when an app is launched for the first time, when it changes on disk or when the XProtect signatures are updated.

The [Developer Tools permission](https://support.apple.com/en-ie/guide/mac-help/mchlc5fb7f9c/26/mac/26) lets the selected app run software that wouldn’t meet the normal system security policy. So choose a development tool you trust when enabling this.

### If your builds run over SSH

If you run the build over SSH, you need to look at the app launching that job too. Enabling the permission for Terminal doesn’t tell you whether the SSH job has it. Here’s how you can add the macOS SSH launcher:

In **Developer Tools**, click **+**. When the file picker opens, press **Command–Shift–G**, enter `/usr/libexec/sshd-keygen-wrapper` and press **Return**:

![The file picker's Go to Folder dialog with /usr/libexec/sshd-keygen-wrapper entered.](/notes/macos-development/developer-tools-ssh-launcher.png)

Select that executable and click **Open**, then enable **sshd-keygen-wrapper** back in **Developer Tools**. You can see it enabled in the settings screenshot above.

You might still see XProtect running after this.
