---
title: "Tuning macOS for development"
summary: "Keep build output out of Spotlight, and check the actual build launcher's Developer Tools permission when investigating XProtect overhead."
author: "Almir Sarajčić"
status: "published"
publishedAt: "2026-10-30"
---
We arrived at these settings while investigating slow builds and failed tests in Kogen. Looking at the processes running alongside the compiler led us to Spotlight indexing and XProtect scanning. A separate failure, where Git disappeared during a test, led us to an automatic Xcode update.

These are the checks that came out of that investigation, with the steps to apply them to your own development Mac.

## Keep build output out of Spotlight

During the investigation, Spotlight's `mds` and `mds_stores` processes were active around directories where builds and tests kept creating files. There was background file activity even when no benchmark was running. That led us to move development output into `.noindex` directories and review explicit exclusions. We have not yet isolated the before-and-after timing for that change.

A development directory can contain dependencies, generated files, temporary executables and several copies of the same repository. Most of that is useful to the build and useless to a system-wide search.

For new projects, you can create a working directory with a `.noindex` suffix:

```sh
mkdir -p ~/work.noindex
```

Spotlight skips directories with that suffix. [Apple's debugging documentation](https://developer.apple.com/documentation/xcode/locating-a-missing-debug-symbol-file) mentions it as something to check when Spotlight cannot find a debug-symbol file.

Put your working copies there and check where your tools write their output. Dependencies and generated files inside the directory are covered; a cache elsewhere in your home directory needs its own exclusion.

You can exclude existing folders without renaming them:

1. Open the **Apple menu → System Settings**, then select **Spotlight** in the sidebar.
2. Click **Search Privacy…** near the bottom of the window.

![Spotlight settings with the Search Privacy button at the bottom right.](/notes/macos-development/spotlight-settings.png)

3. Click **+**, or drag a folder into the list.
4. Add the development, dependency or build-output directories you want excluded, then click **Done**.

![Spotlight's Privacy dialog showing an example list of excluded development and coding-agent folders.](/notes/macos-development/spotlight-exclusions.png)

The screenshot shows an example list, not a set of folders everyone needs to exclude. Choose according to how you search. If you find code through your editor or terminal, excluding a whole working directory may be convenient. If you rely on Spotlight to find source files, exclude only the dependencies and generated output.

[Apple documents the exclusion steps here](https://support.apple.com/en-ie/guide/mac-help/mchl1bb43b84/27/mac/27). Some macOS versions call the panel Spotlight Privacy.

One catch for Xcode users: Spotlight also helps locate `.dSYM` files for crash symbolication. Keep archives and symbols you need it to discover in an indexed location.

## Check XProtect separately

Spotlight exclusions do not exclude a directory from XProtect.

During Kogen's Go tests, `XProtectService` appeared among the busy processes. We temporarily moved Go checks to Linux while investigating, then checked the Developer Tools permission for the SSH launcher used by the build jobs.

[XProtect is macOS's built-in malware protection](https://support.apple.com/en-ie/guide/security/sec469d47bd8/web). Apple documents checks when an app is first launched, changes on disk, or XProtect signatures are updated. Repeatedly compiling and launching executables makes scanning worth investigating when development work slows down.

To find the permission:

1. Open the **Apple menu → System Settings**.
2. Select **Privacy & Security** in the sidebar.
3. Scroll down the right-hand pane and click **Developer Tools**.
4. Find the app that launches your development commands, such as Terminal or your IDE. Use **+** if it is missing, then enable its switch.

![Developer Tools in System Settings, with Privacy & Security selected in the sidebar and separate switches for the SSH launcher and Terminal.](/notes/macos-development/developer-tools.png)

[Apple describes this permission](https://support.apple.com/en-ie/guide/mac-help/mchlc5fb7f9c/26/mac/26) as allowing selected apps to run software that does not meet the normal system security policy. Enable it deliberately for trusted development tools. The screenshot shows the SSH launcher enabled and Terminal disabled; choose the launcher you actually use rather than copying those switch positions.

### If your builds run over SSH

Granting Terminal permission does not establish that an SSH-launched job has the same grant. For the macOS SSH launcher:

1. In **Developer Tools**, click **+**.
2. In the file picker, press **Command–Shift–G** to enter a path.
3. Enter `/usr/libexec/sshd-keygen-wrapper` and press **Return**.

![The file picker's Go to Folder dialog with /usr/libexec/sshd-keygen-wrapper entered.](/notes/macos-development/developer-tools-ssh-launcher.png)

4. Select the executable and click **Open**.
5. Back in **Developer Tools**, enable **sshd-keygen-wrapper**, as shown in the settings screenshot above.

If you only build locally, use the terminal or IDE entry instead; the SSH-specific steps are for remote builds.

Developer Tools is not documented as an off switch for XProtect or a guarantee of faster builds. If you suspect scanning overhead, compare the same build before and after changing the relevant permission. Keep the source, command and cache state consistent, and watch competing work. Time the build as well as observing scanner activity: a busy process alone does not tell you how much longer the build took.

## Choose when Xcode updates

Another Kogen build failed partway through because Git was no longer available to a test. The investigation traced it to the App Store updating Xcode during the run. The installer was busy at the same time that the build lost access to its tools. That is why update timing belongs in this guide too.

An automatic Xcode update can interrupt development by replacing tools a build depends on, while the update itself competes for machine resources. If you installed Xcode through the App Store, choose an idle period for those updates instead of letting them start during a long build.

1. Open the **App Store**.
2. From the menu bar, choose **App Store → Settings**.
3. Turn off **Automatic Updates**.
4. Install pending updates manually from the App Store's **Updates** page when your builds have finished.

![App Store Settings with Automatic Updates unchecked.](/notes/macos-development/app-store-automatic-updates.png)

[Apple documents the app-update controls here](https://support.apple.com/en-us/102629). This setting applies to App Store apps generally, not just Xcode, so make checking for updates part of your maintenance routine.

Background security updates have separate controls. Leave those enabled; scheduling Xcode updates does not require turning off macOS security updates.

Keep build output out of Spotlight, check the permissions for your actual development launcher, and schedule toolchain updates between builds.
