# Third-party notices

Vanta has no bundled third-party code or fonts. It uses the following software and services, each the property of its respective owners and used under its own license or terms.

## Loaded only when needed

| Component | License | Notes |
|---|---|---|
| [JSZip](https://stuk.github.io/jszip/) 3.10.1 | MIT or GPL-3.0 (dual licensed); used here under MIT | Downloaded from cdnjs.cloudflare.com only when you import a Notion export ZIP. Not included in this repository or in the built app. |

## Services

| Service | Notes |
|---|---|
| [Notion API](https://developers.notion.com) | Optional. Used read-only with your own integration secret. Subject to Notion's terms and policies. |

## Apple frameworks

The Mac app uses Apple's Cocoa (AppKit), WebKit, Security and CryptoKit frameworks, and the interface uses the system font (SF Pro). These are part of macOS and governed by Apple's software license agreements. No Apple code is included in this repository.

## Build tools

Building uses Apple's Swift compiler and Python 3 from the Command Line Tools. They are not included in the finished app.
