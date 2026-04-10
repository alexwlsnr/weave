# Weave

A graphical pattern composer built on top of [Strudel](https://strudel.cc). Compose music by clicking a drum grid and sketching on a piano roll — the underlying Strudel code generates live and can be copied straight into the Strudel REPL.

**Live demo:** https://alexwlsnr.github.io/weave/

---

## What it does

- **Drum Sequence cards** — 16-step grid per track (bd, sd, hh, oh, cp). Click steps to toggle. Steps glow in their track colour when active; quarter-beat gaps keep the grid readable.
- **Melody cards** — mini piano roll. Click to place or remove notes. Instrument selector (triangle, sawtooth, square, sine, supersaw, pulse).
- **Modifier chips** — drag fast, slow, rev, lpf, delay, or reverb from the sidebar onto any card. Each chip has an inline slider for its parameter.
- **Live playhead** — the active drum step and piano roll position highlight in real time while playing.
- **Live code updates** — changes to any card are debounced (400ms) and re-evaluated mid-loop without stopping playback. The code bar at the bottom shows sync state: violet = in sync, amber = pending, red = error.
- **Strudel REPL link** — the generated code is base64-encoded into the URL so "try at strudel.cc" opens your exact pattern in the Strudel playground.
- **Butterchurn visualiser** — fullscreen WebGL Milkdrop-style visualiser driven by the live audio output. Toggle with the VIZ button. Auto-cycles through 100 presets every 30 seconds with a blend transition.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Svelte 5 (runes) + Vite |
| Package manager | Bun |
| Audio engine | [@strudel/web](https://github.com/tidalcycles/strudel) |
| Visualisation | Custom Canvas2D + [Butterchurn](https://github.com/jberg/butterchurn) (WebGL) |
| Styling | Tailwind CSS v4 + CSS custom properties |

---

## Running locally

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/alexwlsnr/weave.git
cd weave
bun install
bun dev
```

The first run fetches Strudel's dirt-samples from GitHub (~100MB). They are cached by the browser after the first load.

---

## How patterns are generated

Each card produces a Strudel expression. Multiple cards are wrapped in `stack()`. For example, a drum card with bd on beats 1 and 3 and a "fast ×2" modifier generates:

```javascript
sound("bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~ bd ~ ~ ~").fast(2)
```

The full generated code is shown (and copyable) in the code bar at the bottom of the app.

---

## Licence

**GNU Affero General Public License v3.0 (AGPL-3.0)**

Weave depends on [Strudel](https://github.com/tidalcycles/strudel), which is AGPL-3.0. Under the AGPL, anyone who deploys a modified version of this software over a network must publish their source code. This repository is that source.

See [LICENSE](./LICENSE) for the full licence text.

In brief: you can use, fork, and modify Weave freely. If you deploy a modified version publicly, you must publish your source. Commercial use is permitted.

---

## Credits

- [Strudel](https://strudel.cc) by the TidalCycles community — the live coding engine powering all audio
- [Butterchurn](https://github.com/jberg/butterchurn) by Jordan Berg — WebGL Milkdrop visualiser
- [Milkdrop presets](https://github.com/jberg/butterchurn-presets) — community-created visualiser presets
