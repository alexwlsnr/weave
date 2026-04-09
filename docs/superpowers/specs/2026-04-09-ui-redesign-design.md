# Weave UI Redesign + Live Update — Design Spec
**Date:** 2026-04-09

---

## Overview

Two goals:
1. **Visual redesign** — replace the current generic dark UI with a premium "Neon Synth" aesthetic that feels like a proper music tool
2. **Live updates** — changes to cards (steps, notes, instrument, modifiers) apply to the playing pattern automatically via debounced re-evaluate

---

## 1. Design Direction: Neon Synth

### Colour palette

| Role | Value | Usage |
|------|-------|-------|
| Background | `#050510` | App background |
| Surface 1 | `#0d0520` | Cards, sidebar |
| Surface 2 | `#080320` | Transport, code bar |
| Border subtle | `#1a0535` | Dividers, card borders |
| Border active | `#2d0a5e` | Step buttons off, inputs |
| Accent violet | `#7c3aed` | Primary accent, glows |
| Accent violet light | `#c084fc` | Active steps (bd), chip text |
| Accent cyan | `#38bdf8` | Active steps (sd), secondary accent |
| Accent green | `#4ade80` | Active steps (hh) |
| Accent amber | `#f59e0b` | Code bar pending state |
| Accent red | `#ef4444` | Code bar error state |
| Text primary | `#e0c0ff` | Headings, active labels |
| Text secondary | `#7040c0` | Muted labels |
| Text dim | `#3d1060` | Section labels, placeholders |

### Typography
- **UI labels:** `system-ui` / `-apple-system` sans-serif — clean, fast, no custom font load
- **Code panel, track labels, step counts:** `monospace` — reinforces the code/pattern identity

### Glow effects
Active drum steps use `box-shadow` glow matching their colour. Glow intensity is moderate — enough to read at a glance, not distracting during use.

---

## 2. Layout

```
┌─────────────────────────────────────────────────────────┐
│  TRANSPORT BAR                                           │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│   SIDEBAR    │   CANVAS                                 │
│   (144px)    │   (flex-wrap cards)                      │
│              │                                          │
│   Cards      │                                          │
│   Modifiers  │                                          │
│   Presets    │                                          │
│              │                                          │
├──────────────┴──────────────────────────────────────────┤
│  CODE BAR                                               │
└─────────────────────────────────────────────────────────┘
```

### Transport bar
- Logo "Weave" in violet monospace with glow
- Play / Stop buttons: outlined style (transparent bg, violet/dim border)
- BPM input: inline number input, monospace
- Card count indicator right-aligned (dim text)

### Sidebar (144px wide)
- Section headers: tiny uppercase monospace labels, no emojis
- Card templates: text-only buttons ("Drum Grid", "Melody") — clicking adds a card to canvas
- Modifier palette: draggable chips in their colour (violet=fast/slow, cyan=lpf, etc.) — text only
- Preset section: text buttons for quick-start patterns

### Canvas
- `flex-wrap` layout — cards flow left-to-right, wrap to next row
- Empty state: centred dim text, no decorative elements
- Cards are not draggable to reorder in this iteration

### Code bar — gradient gutter
- Always visible at bottom, ~36px collapsed height
- **Left gutter** (4px wide): colour signals sync state
  - Violet `#7c3aed` — pattern in sync with what's playing
  - Amber `#f59e0b` — changes pending, re-evaluate queued
  - Red `#ef4444` — evaluate threw an error
- **Collapsed state:** single line showing first line of generated code + "copy" button
- **Expanded state:** click anywhere on bar to toggle; shows full formatted code block, "copy" button, "strudel.cc ↗" link
- Gutter colour updates immediately on any card change; code re-evaluates after 400ms debounce

---

## 3. Card Design: Spacious + Rounded

### Drum Sequence Card

```
┌─────────────────────────────────────────────┐
│  ● DRUM SEQUENCE                    [active] │
│                                             │
│  bd  [ ][ ][ ][ ] [ ][ ][ ][ ] ...         │
│  sd  [ ][ ][ ][ ] [■][ ][ ][ ] ...         │
│  hh  [■][ ][■][ ] [■][ ][■][ ] ...         │
│                                             │
│  [fast ×——●] [lpf ——●——]                    │
│                                             │
│  ▓▓▓▓░░░░░░░░░░░░░░░░░░  (DrumViz canvas)  │
└─────────────────────────────────────────────┘
```

- Card border: 1px `#1e0848`, border-radius 12px
- Header: glowing violet dot + "DRUM SEQUENCE" label + mute toggle (pill button)
- Steps: 14px tall, 3px gap, border-radius 3px
  - Off: `#160840` (darker on quarter beats: `#1c0d48`)
  - On (bd): `#c084fc` + `box-shadow: 0 0 7px #9333ea`
  - On (sd): `#38bdf8` + `box-shadow: 0 0 7px #0ea5e9`
  - On (hh): `#4ade80` + `box-shadow: 0 0 7px #22c55e`
- Quarter-beat groupings: subtle `margin-left: 4px` every 4 steps
- Modifier chips: outlined pill with inline range slider (28px), thumb glows on hover
- DrumViz canvas below the grid: 8px per step cell, same colours, read-only visualisation of queryArc output
- "+ add track" text link below tracks (max 6 tracks)
- Remove card: dim "×" top-right, reveals on card hover

### Melody Card

- Same card chrome (dot, title, mute toggle)
- Piano roll canvas (400×160px) — click to add notes, click existing to remove
  - Lane backgrounds alternate dark/darker for black keys
  - Beat gridlines in `#1e293b`
  - Notes: `#7c3aed` fill with `#a78bfa` left-edge highlight + glow
  - Cursor: crosshair
- Instrument selector: small outlined `<select>` in header row
- Same modifier chip style as drum card
- Note count + "clear" link below roll

### Modifier Chips

- Pill shape, outlined: `border: 1px solid [accent]`, `border-radius: 20px`
- Text + inline range slider for parameterised modifiers (fast, slow, lpf, delay, reverb)
- Slider thumb: 6px circle, glows in chip accent colour
- Non-parameterised (rev): text only
- Remove: dim "×" on right

---

## 4. Live Updates — Auto Debounce

### Mechanism

A single `$effect` in `App.svelte` watches `generateProjectCode(store.cards)`:

```
cards change → code string changes → debounce 400ms → if isPlaying: evaluate(code)
                                                      → gutter turns violet
                                    → gutter turns amber immediately on change
```

- Debounce fires 400ms after the **last** change (standard trailing debounce)
- Gutter goes amber instantly on any change, violet when evaluate fires
- If `!isPlaying`: gutter still shows pending amber — apply fires next time Play is pressed
- Evaluate errors caught → gutter turns red, error message shown in expanded code drawer

### Implementation

In `App.svelte`:
```ts
let lastCode = $state('')
let codeStatus = $state<'synced' | 'pending' | 'error'>('synced')
let debounceTimer: ReturnType<typeof setTimeout>

$effect(() => {
  const code = generateProjectCode(store.cards)
  if (code === lastCode) return
  codeStatus = 'pending'
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (!store.isPlaying) return
    try {
      play(code)
      lastCode = code
      codeStatus = 'synced'
    } catch {
      codeStatus = 'error'
    }
  }, 400)
})
```

When Play is pressed, always evaluate current code and reset to synced.

---

## 5. Files Changed

| File | Change |
|------|--------|
| `src/app.css` | New CSS custom properties for colour tokens |
| `src/App.svelte` | Live-update `$effect`, pass `codeStatus` to CodePanel |
| `src/components/TransportBar.svelte` | Neon Synth styling, play sets codeStatus=synced |
| `src/components/Palette.svelte` | Neon Synth styling, remove emojis |
| `src/components/Canvas.svelte` | Empty state styling |
| `src/components/CodePanel.svelte` | Gradient gutter, expand/collapse, amber/violet/red states |
| `src/components/cards/DrumSequenceCard.svelte` | Spacious card design, quarter-beat gaps |
| `src/components/cards/MelodyCard.svelte` | Spacious card design |
| `src/components/modifiers/ModifierChip.svelte` | Pill + inline slider redesign |
| `src/viz/DrumViz.svelte` | Update colours to match new palette |
| `src/viz/MelodyViz.svelte` | Update colours to match new palette |

---

## 6. Out of Scope

- Draggable card reordering
- Playhead animation (canvas sweep) — deferred
- Mobile / touch
- Undo/redo
