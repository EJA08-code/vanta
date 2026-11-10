# Privacy statement

_Last updated: November 10, 2026_

Vanta was built to be private by design. This statement explains exactly what the app does with information.

## The short version

- **Vanta does not collect, sell or share any of your information.**
- There are **no accounts, analytics, telemetry, crash reporting, advertising or tracking**.
- The author **has no servers** and **cannot see** anything you write in Vanta.
- Your journal and screenshots are stored **only on your Mac**.
- Vanta talks to the internet only for the two optional features described under [Network use](#network-use).

## What is stored, and where

| What | Where | Why |
|---|---|---|
| Your trades, notes, playbook and settings | `~/Library/Application Support/Vanta/journal.json` | So your journal is there next time |
| Your screenshots | `~/Library/Application Support/Vanta/images/` | Kept as separate files so the journal stays small |
| Daily backups of your journal (newest 14) | `~/Library/Application Support/Vanta/backups/` | Recovery if the main file is damaged |
| Your Notion integration secret, if you add one | The macOS Keychain, item `local.vanta.notion` | So Vanta can read your Notion journal |
| Your theme and accent color | The app's local web storage | To show the right look before the journal loads |
| Temporary files from the web engine (cache and similar) | `~/Library/Caches` and `~/Library/WebKit`, under `local.vanta.journal` | Created automatically by macOS's WebKit |

If you choose another folder in Settings, the journal, screenshots and backups are stored there instead.

These files are not encrypted by Vanta. They are protected by your macOS user account and, if you have it turned on, FileVault disk encryption. Anyone with access to your Mac user account can read them. Your Mac's own backup tools (such as Time Machine or iCloud, if you have set them up to include this folder) may copy them. Vanta does not control those tools.

## Network use

Vanta works fully offline unless you use these features:

- **Notion sync (optional, off until you add a key).** Vanta sends read-only requests to `api.notion.com` with your integration secret, and downloads the screenshots attached to your Notion pages from the addresses Notion gives it. Your trades come from Notion to your Mac. Nothing from Vanta is written to Notion, and the app blocks any request that could change it. How Notion handles your data is described in Notion's own privacy policy.
- **Importing a Notion export ZIP.** At that moment Vanta loads the open-source JSZip library from `cdnjs.cloudflare.com` to unpack the file. That request is a normal download of a public file, so Cloudflare can see your IP address, but your journal is not sent.
- **Links you click** (for example "Open in Notion") open in your web browser.

Vanta makes no other network requests.

## macOS features Vanta uses

- **Keychain:** stores the Notion secret. macOS may ask you to allow Vanta to use it, for example after the app is rebuilt.
- **Open and save panels:** only when you choose a folder, import a file or export a backup.

Vanta does not ask for access to your contacts, calendar, location, camera, microphone, photos, brokerage accounts or other apps, and it never connects to a broker or places trades.

## Deleting your data

Delete the folder `~/Library/Application Support/Vanta` (or the folder you chose) to permanently remove your journal, screenshots and backups. To remove the Notion secret, use Settings → Notion → Disconnect, or delete the `local.vanta.notion` item in Keychain Access. Deleting Vanta's data does not delete anything in Notion.

## Children

Vanta is general-purpose software and does not knowingly collect information from anyone, including children, because it does not collect information at all.

## This GitHub page

This statement covers the Vanta app. If you visit this project on GitHub, open an issue or download the code, **GitHub** may collect information under the [GitHub Privacy Statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). Anything you post publicly in issues or pull requests (including screenshots, trades or account details) is visible to everyone, so please don't post personal or financial information there.

## Changes

If a future version ever changes how information is handled, this file will be updated and the change will be described in the project's release notes. The "last updated" date at the top shows the current version.

## Contact

Questions about privacy: please [open an issue](https://github.com/EJA08-code/vanta/issues) without including personal information.
