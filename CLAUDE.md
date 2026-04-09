# Weave — Claude Instructions

## Licence: AGPL-3.0 (read this before adding dependencies)

This project depends on `@strudel/web`, which is licensed under the **GNU Affero General Public License v3 (AGPL-3.0)**. That licence governs this entire project.

### What the AGPL requires

- **Network use = distribution.** Because users interact with Weave over a network, the AGPL's source-disclosure obligation applies — even though no binary is "shipped."
- **All source must be published.** The complete source code of the running application must be available to users. A public GitHub repo satisfies this; a link to it must appear in the UI.
- **Copyleft is sticky.** Any code added to this project becomes AGPL. There is no dual-licensing escape unless Strudel's authors grant one.

### What the AGPL allows

- Commercial use, paid tiers, ads — AGPL is not anti-commercial.
- Using MIT/Apache/BSD/ISC libraries as dependencies — permissive licences are compatible inbound.

### Before adding any dependency, check its licence

| Licence | Compatible? | Notes |
|---------|-------------|-------|
| MIT, BSD, Apache-2.0, ISC | ✅ Yes | Fine to use |
| LGPL | ✅ Yes (dynamic link) | Fine as a library dependency |
| GPL-2.0 | ⚠️ Unclear | Avoid unless verified compatible |
| GPL-3.0 | ✅ Yes | Compatible with AGPL-3.0 |
| AGPL-3.0 | ✅ Yes | Same licence |
| Proprietary / commercial | ❌ No | Hard block — cannot be included |
| CC-BY-NC, "non-commercial" | ❌ No | Incompatible with commercial use |

**When in doubt: check before installing, not after.**

## Project overview

Weave is a graphical pattern composer built on top of Strudel. Users compose music by clicking a drum grid, sketching a melody on a piano roll, and dragging modifier chips onto pattern cards. The generated Strudel code is shown live in a code panel.

## Tech stack

- **Framework:** Svelte 5 + Vite
- **Package manager:** bun
- **Audio engine:** @strudel/web (headless; `initStrudel()` + `evaluate()`)
- **Styling:** Tailwind CSS v4
- **Visualisation:** custom Canvas2D (queryArc() → Haps → render)

## Key architectural notes

- `store.svelte.ts` — global reactive state as a class (`AppStore`) so `$state` fields work in a `.svelte.ts` file
- `engine/strudel.ts` — wraps `initStrudel`, `evaluate`, `hush`; samples loaded via `prebake`
- `engine/codegen.ts` — card data → Strudel code string; `silence` (not `silence()`) for empty patterns
- Cards passed with `bind:card={card}` from Canvas so children can mutate them without ownership warnings
