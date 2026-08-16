# WithYou Design System

Adapted from the visual design system of the [Kinto Next.js template](https://kinto-nextjs-template.vercel.app/),
extracted from its compiled CSS (actual token values, not a visual approximation), and fitted
to this app's existing shadcn/Tailwind CSS-variable architecture (`src/app/globals.css`,
`@theme inline`).

Warm, editorial tone rather than a cool, generic SaaS-gray look. Airy spacing over density.

---

## Color tokens

Warm cream backgrounds with a single amber/tan accent, used sparingly and specifically (see
Typography below — its main job is coloring the mono micro-label motif, not large surfaces).

| Token | Light | Dark | Role |
|---|---|---|---|
| `background` | `#f4f3ee` | `#13110d` | page background (warm cream, not white) |
| `foreground` | `#1f1c18` | `#e8e6e1` | body text |
| `card` | `#fefdfc` | `#1a1714` | card surfaces (slightly lighter than background) |
| `card-foreground` | `#1f1c18` | `#e8e6e1` | text on cards |
| `primary` | `#1f1c18` | `#e8e6e1` | primary buttons/high-emphasis fills |
| `primary-foreground` | `#f4f3ee` | `#13110d` | text on primary fills |
| `secondary` | `#e8e6e1` | `#211e1b` | secondary surfaces |
| `muted` | `#e8e6e1` | `#26231f` | muted surfaces |
| `muted-foreground` | `#625f5b` | `#7f7c77` | secondary/quiet text |
| `accent` | `#bc8b4c` | `#c99858` | the warm amber — eyebrow labels, links, highlights |
| `accent-hover` | `#a87a3b` | `#dcab6d` | accent hover state |
| `accent-light` | `#e7d7be` | `#3e3323` | accent-tinted borders/dividers |
| `accent-subtle` | `#f3ede3` | `#231e17` | accent-tinted backgrounds (badges) |
| `destructive` | `#e40014` | `#e40014` | errors, missed/urgent states |
| `success` | `#668667` | `#668667` | positive/confirmed states (new — didn't exist before) |
| `border` / `input` | `#d9d7d2` | `#302d29` | hairlines, input borders |
| `ring` | `#bc8b4c` | `#c99858` | focus ring (matches accent) |

## Typography — a 3-font system, each with exactly one job

- **DM Sans** — body text and UI chrome. Already in use in this app.
- **DM Serif Display, italic** (`font-display`) — editorial emphasis only: page/section
  `<h1>`s and pull-quote-style callouts. Not for body copy or small text — it's a headline
  voice, used deliberately and sparingly.
- **JetBrains Mono** (`font-mono`) — the signature motif of this system. Small
  (`text-xs`/`text-[0.625rem]`), **uppercase**, **wide letter-spacing** (`tracking-wider`),
  usually in the accent color. Used for: eyebrow labels above content ("UPCOMING",
  "PRESCRIPTIONS"), nav links, timestamps/metadata, badges. This — not the accent color itself
  — is what makes the UI read as editorial rather than generic. If you're labeling or
  timestamping something, it's mono-uppercase-tracked; if you're writing a sentence, it isn't.

Rule of thumb: three fonts, three registers — DM Sans reads, DM Serif Display italic
announces, JetBrains Mono labels. Don't mix registers (e.g. no italic serif body text, no
mono paragraphs).

## Shape

- Base radius: `--radius: .625rem` (10px), scaled via multipliers for sm/md/lg/xl — matches
  this app's existing `@theme inline` radius-token pattern, just a different base value.
- Buttons, badges, and nav links are **fully pilled** (`rounded-full`), not just
  rounded-corner rectangles. Cards keep a moderate radius (`--radius-lg` equivalent).

## Spacing / density

Airy, not compact. Generous gaps between sections and list items over tight information
density. When in doubt, add more breathing room rather than less.

## Component patterns

- **Eyebrow labels**: `font-mono text-xs tracking-wider uppercase text-accent` above a
  section or card's main content (e.g. above "Upcoming appointments", above a dashboard stat).
- **Timestamps/metadata**: `font-mono text-xs text-muted-foreground` (same mono treatment,
  muted rather than accent color, since it's secondary info not a label).
- **Buttons**: solid `bg-primary` for the primary action, `border-border` outline for
  secondary, both `rounded-full`.
- **Status badges**: pill-shaped, accent-subtle background + accent-colored text
  (`bg-accent-subtle text-accent-hover`) rather than the generic Tailwind `green-100`/
  `amber-100`/`red-100` swatches used before this system — map semantically: success states
  use the `success` token, urgent/missed states use `destructive`, neutral/pending states use
  `accent` or `muted`.
- **Headings**: page-level `<h1>` uses `font-display italic` (DM Serif Display); everything
  below that (card titles, labels) stays in DM Sans or mono per the rules above.

## What this system is *not*

- Not a rebrand of color meaning — `destructive` still means "something needs attention,"
  `success` still means "resolved/fine." Only the actual hex values and where they're applied
  changed.
- Not a request to add new visual chrome beyond what's specified above (no new illustration
  style, no new iconography system) — this is a token + typography + shape pass on the
  existing screens, not a new layout.
