# Security

Vanta is a hobby project maintained by one person, with no security team and no guaranteed response time.

## Reporting a problem

If you find a security problem, please **do not post details publicly**. Use GitHub's private reporting instead: go to the repository's **Security** tab and choose **Report a vulnerability**.

Please include what you found, how to reproduce it, and which version of Vanta and macOS you used.

## What to expect

Reports are read on a best-effort basis. There is no bug bounty and no promise that a fix will be released. See [DISCLAIMER.md](DISCLAIMER.md).

## Design notes

- After you paste the Notion integration secret, it is stored only in the macOS Keychain. It is never written to the journal file, and the page cannot read it back.
- All Notion requests go through the native app, which allows only a fixed list of read requests (reading page contents, reading the database's fields, checking the integration, searching, and querying the database). Anything else is refused, so Vanta cannot change your Notion workspace.
- Screenshots are saved as files named by their SHA-256 hash and shown through a private `vanta-img://` address. Links opened from the app are limited to Notion addresses.
- The journal is stored as unencrypted JSON in your user folder, protected by your macOS account and FileVault if enabled.
- Importing a Notion export ZIP loads the JSZip library from cdnjs.cloudflare.com at that moment.
- The app is ad-hoc signed and not notarized by Apple.
