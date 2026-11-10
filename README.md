# Vanta

**One honest answer about your trading.**

Vanta is a small, free, private trading journal for the Mac. Log a trade in a few seconds, add screenshots, mark what went right and what went wrong, and Vanta shows you how you are really doing, measured in R, points or money.

Everything stays on your Mac. No account, no cloud, no tracking, no ads. If you already keep your journal in Notion, Vanta can read it (it never writes to Notion).

> **Please read before using:** Vanta is a personal hobby project built with the help of an AI assistant. It is provided **as is, with no warranty**, and it may contain bugs. Its numbers can be wrong. **It is not financial advice** and must not be the basis for any trading or investment decision. See [DISCLAIMER.md](DISCLAIMER.md).

---

## Contents

- [What it does](#what-it-does)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Requirements](#requirements)
- [Install and build](#install-and-build)
- [Connecting Notion (optional)](#connecting-notion-optional)
- [Where your data lives](#where-your-data-lives)
- [Uninstall](#uninstall)
- [Known limitations and bugs](#known-limitations-and-bugs)
- [How this was made (AI disclosure)](#how-this-was-made-ai-disclosure)
- [Privacy](#privacy)
- [Contributing and support](#contributing-and-support)
- [License and legal](#license-and-legal)

## What it does

- **Overview:** your running total in R, points or money, a growing equity chart, win rate, profit factor, average per trade and drawdown. "From your past" brings back something you wrote about an earlier trade.
- **Trades:** a searchable list. Each trade holds the date, symbol, outcome, points, R:R, strategy, rating, notes, screenshots and your own review fields (for example confluences, session, behaviors and mistakes).
- **Calendar:** results by day, with a note for each day.
- **Insights:** compare results by strategy, symbol, day of week, hour, mistake, rating, month or any of your own fields, including what happens when you broke your rules.
- **Playbook:** write down each strategy's rules and see whether it pays.
- **Review them:** walks you one at a time through trades that are missing a result.
- **Import:** from a CSV file or a Notion export, with automatic column matching.
- **Read-only Notion sync** (optional, see below).
- **Safety nets:** automatic daily backups (the newest 14 are kept), Undo after deleting, and a question before closing a changed trade.
- **Light, dark or automatic theme**, an accent color you choose, and a short startup animation (any key or click skips it).

## Keyboard shortcuts

| Keys | Action |
|---|---|
| `N` | New trade |
| `⌘↵` | Save the open trade |
| `Esc` | Close a menu, then the open trade |

## Requirements

- A Mac with **macOS 13 or newer** (the minimum the app declares).
- Developed and tested only on **macOS 27** on one MacBook Air (Apple M3). Other versions of macOS and Intel Macs have **not been tested**.
- To build it: Apple's Command Line Tools (`xcode-select --install`), which include `swiftc` and `python3`.

## Install and build

There is no signed, notarized download yet. To run Vanta you build it from this source code:

```bash
git clone https://github.com/EJA08-code/vanta.git
cd vanta
bash native/build_app.sh
```

The finished app appears as `Vanta.app` in the same folder. Move it to your Applications folder if you like.

How it is put together:

| Part | What it is |
|---|---|
| `src/` | The app itself: `styles.css`, `engine.js` (calculations and import), `notion.js` (Notion sync) and `ui.js`. `build.py` joins them into one page, `vanta.html`. |
| `native/main.swift` | A small Mac app that shows that page in a native window, stores your journal and screenshots, and keeps the Notion key in the Keychain. |
| `assets/` | The logo and app icon. |
| `DESIGN.md` | The design rules the interface follows. |

The app is signed only "ad hoc" (not with an Apple Developer ID) and is not notarized by Apple. If you copy it to another Mac, macOS may warn that it can't verify the developer. Only open software you trust.

## Connecting Notion (optional)

Vanta can read trades from a Notion database you already use. It **only reads**: the Mac app refuses every Notion request that could create, change or delete anything.

1. In Notion, create an internal integration at [notion.so/my-integrations](https://www.notion.so/my-integrations) with read access, and copy its secret.
2. In Vanta, open Settings → Notion and paste the secret. It is stored only in your Mac's Keychain.
3. In Notion, open your trading journal database, then ••• › Connections, and add the integration.

Vanta checks for changes about once a minute while its window is open. Notion is treated as the source of truth for trades that come from it, so edit those trades in Notion. A trade that disappears from Notion is flagged for you to review, never deleted automatically.

Vanta matches Notion properties by name and type. It was built around one journal's layout, so a database set up very differently may not map every field.

## Where your data lives

Your journal is a plain JSON file, and screenshots are ordinary image files:

```
~/Library/Application Support/Vanta/
  journal.json   your trades, notes and settings
  images/        your screenshots
  backups/       one copy of journal.json per day, newest 14 kept
```

Settings can move this folder somewhere else and can export a backup. Back it up yourself if your journal matters to you. Vanta does not sync or back up anywhere else.

## Uninstall

1. Quit Vanta (⌘Q).
2. Delete `Vanta.app`.
3. To also delete your journal, delete the folder `~/Library/Application Support/Vanta` (or the folder you chose in Settings). **This cannot be undone.**
4. If you connected Notion, remove the key: in Vanta use Settings → Notion → Disconnect, or delete the Keychain item named `local.vanta.notion` in Keychain Access.

## Known limitations and bugs

Vanta is early, personal software. Known issues include:

- **Calculations can be wrong**, for example when a trade has an outcome but no R:R. Trades missing a result count as zero, and Vanta tells you how many there are.
- **Notion sync is one-way and only checks while the window is open.** macOS may pause it when the window is hidden or on another desktop, so a sync can wait until you look at Vanta again.
- **Changes you make in Vanta to a trade that came from Notion can be replaced** the next time it changes in Notion.
- Importing a Notion export ZIP downloads a small open-source library (JSZip) from cdnjs.cloudflare.com at that moment, so it needs the internet.
- There are no automated tests in this repository. Testing was done by hand and with throwaway scripts during development.
- Not tested with very large journals, multiple user accounts, or accessibility tools such as VoiceOver.

Found a bug? Please [open an issue](https://github.com/EJA08-code/vanta/issues).

## How this was made (AI disclosure)

Vanta was designed by EJA08-code and built in collaboration with **Claude**, an AI assistant made by Anthropic, using Claude Code. Most of the code was written by the AI under the author's direction and then tested by hand and with temporary test scripts.

That means:

- The code has **not been reviewed by a professional security auditor**, and there may be mistakes the testing did not catch.
- Anthropic is not a party to this project and does not endorse, maintain or support it.

## Privacy

Short version: **Vanta collects nothing.** It has no accounts, analytics, telemetry, ads or servers. It only connects to the internet for Notion, if you turn that on, and for one library when you import a Notion export. The full statement is in [PRIVACY.md](PRIVACY.md).

## Contributing and support

Issues and pull requests are welcome, but this is a hobby project: there is **no guaranteed support, response time or future updates**. Security problems: see [SECURITY.md](SECURITY.md).

## License and legal

- Code: [MIT License](LICENSE), provided as is, without warranty of any kind.
- Other software and services Vanta uses: see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
- Please read the [Disclaimer](DISCLAIMER.md) and [Privacy statement](PRIVACY.md).

Mac and macOS are trademarks of Apple Inc. Notion is a trademark of Notion Labs, Inc. Claude is a trademark of Anthropic. Vanta is an independent hobby project and is not affiliated with, endorsed by or sponsored by Apple, Notion, Anthropic, GitHub, any broker or trading platform, or any company with a similar name.
