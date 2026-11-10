# Vanta design system

Vanta is a private trading journal. The name is the brief: a black so deep it absorbs everything that isn't needed. A trader opens it before or after a session, often with a head full of charts. The interface should lower the noise, then show one honest answer.

Sources this was morphed from: **Apple** (restraint, tracking by size, materials with a purpose), **Uber** (black and white confidence, one strong action), **Notion** (writing surfaces that feel calm). Nothing was copied whole. Their marketing layouts, blues and sticker colors do not apply.

## Principles

1. **One answer per screen.** Each page leads with the thing it exists to tell you. Everything else sits lower or one level deeper.
2. **Space replaces boxes.** Sections are separated by whitespace and hairlines. No card grids, no nested panels.
3. **Color is information.** The interface is monochrome. Green and red appear only on results, and never change. The one chosen color is the accent, which lights the panel edge, the charts and the primary action.
4. **Common path first.** Advanced options stay available behind a disclosure, never removed and never in the way.
5. **Forgiving.** Deleting offers Undo. Closing a changed trade asks first. Saving is automatic.

## Color

| Token | Dark | Light | Use |
|---|---|---|---|
| `--bg` | `#000000` | `#FFFFFF` | Canvas |
| `--side` | `#141416` | `#F2F2F5` | Floating panel |
| `--raise` | `#111113` | `#FFFFFF` | Sheets, menus, dialogs |
| `--field` | `#1A1A1D` | `#F2F2F4` | Inputs, segmented controls |
| `--hover` | `#16161A` | `#F5F5F7` | Hover, selected row |
| `--line` | `#26262A` | `#E5E5E8` | Hairlines |
| `--text` | `#F5F5F7` | `#1D1D1F` | Primary text |
| `--muted` | `#A1A1A6` | `#6E6E73` | Secondary text |
| `--win` | `#4CC38A` | `#0B7F52` | Positive results only |
| `--loss` | `#FF6369` | `#D1242F` | Negative results, destructive actions |
| `--accent` | `--text` | `--text` | Primary action and focus. Users may override it in Settings. |

Dark is the default because the journal is used next to charting platforms. Auto and Light are one click away in Settings.

## Type

One family: the system font (SF Pro on Mac). It is native, works fully offline, and has real optical sizing. All numbers are tabular.

| Role | Size / weight | Tracking |
|---|---|---|
| Result headline | 72px / 600 (52px on phone) | -0.035em |
| Page title | 28px / 600 | -0.02em |
| Section title | 17px / 600 | -0.01em |
| Body | 15px / 400, line height 1.5 | 0 |
| Label, meta | 13px / 400–500 | 0 |

No eyebrow labels above headings. No all-caps.

## Space and shape

- 4px base. Common steps: 8, 12, 16, 24, 40, 72.
- Content column is 1040px at most, with 72px between sections.
- Radius: 8 for small controls, 10 for fields and buttons, 16 for sheets and dialogs.
- Elevation is declared once. Sheets and menus use a soft shadow on dark, never a border plus a wide glow.

## Layout

- **Floating panel, 220px:** logo, Add trade, five destinations. Import and Settings sit apart at the bottom. It floats 12px off the window edges, 14px radius, with a neon edge at 50% strength in the accent color. In the Mac app it starts 34px down, so the window buttons sit on the canvas above it. The logo always stays white or black, never the accent.
- **Phone:** four tabs and a center add button. No horizontal page scrolling.
- **Trade editor:** a sheet from the right that keeps the journal visible behind it. On phone it rises from the bottom.

## Pages

| Page | The one answer | Moved deeper |
|---|---|---|
| Overview | How am I doing? | Score, daily bars and strategy bars are off by default, and can be switched on |
| Calendar | What happened that day? | Notes share this page, because a note belongs to a day |
| Trades | Find a trade | Extra columns are opt-in. Bulk actions appear on selection |
| Insights | What is working? | What-if sits in a disclosure |
| Playbook | What are my rules, and do they pay? | Nothing |
| Import | Get trades in | Column matching is automatic and only opens if needed |
| Settings | Change one thing | Every group is collapsed |

## Notion

Notion is the source of truth for trades that come from it. Vanta only reads: the Mac app's bridge refuses any request that could write, and the key lives in the Keychain. A trade that disappears from Notion is flagged for review, never deleted automatically.

## Motion

Motion only reports a state change.

- Press: scale 0.98, instantly on pointer down.
- Sheet: slides from its edge and leaves the same way, 320ms `cubic-bezier(.32,.72,0,1)`.
- Page change: no choreography.
- `prefers-reduced-motion`: slides become short fades. `prefers-reduced-transparency`: the phone tab bar becomes solid.

## Startup

Plays on launch only, about 2.4 seconds, and any click, Space or Esc skips it. The logo and name appear unlit, the logo fades up to its glow with no flicker and fades back out, then two black doors slide apart along a diagonal through the logo, each carrying one logo piece. The panel's neon eases on last. The doors wait for the journal to load, so they never open onto an empty screen. Only opacity and transform animate, because masking the whole app stuttered. With reduced motion it becomes a simple fade.

## Writing

Plain and direct. Controls name their action ("Import 33 trades", not "Submit"). Errors say what went wrong and what to do next. Missing data shows as a dash, never as a zero that looks real.

## Do not

- Add cards to hold content that spacing can separate.
- Use color for decoration, including on charts where direction is already clear.
- Show a control that does nothing on this screen.
- Use native browser `confirm` or `prompt` dialogs.
- Change the journal.json format without a migration. It is the user's data.
