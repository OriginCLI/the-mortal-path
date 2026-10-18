# The Mortal Path

A BitLife-style text-and-menu life simulator set in a murim (Korean martial arts / wuxia) world.
Live one life season by season, cultivate qi, navigate the sects, and when you die, wake as a child on
the day you were born, remembering everything. What carries over is knowledge — of the world's fixed
history, its secrets, its people and its martial theory — not stat boosts.

The game is a static website hosted on GitHub Pages, written in plain HTML, CSS and JavaScript with no
libraries. All graphics are SVG, CSS and canvas, and all sound is synthesized live with the Web Audio
API. There are no image or audio files in the repository.

## Play

- Game: `https://origincli.github.io/the-mortal-path/`
- Design tool (Phase 1): `https://origincli.github.io/the-mortal-path/design/`

It is built phone-first and works offline after the first visit (it can be installed to a home screen).
Run it locally with any static file server from the repository root:

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

The pages use ES modules, so they must be served over HTTP; opening `file://` paths directly won't work.

## Status

**Phase 1: Design Trials (done).** `/design/` is a gamified design questionnaire: twelve trials, one per
design topic, with live previews (sample prose, a faction map, UI mockups, synthesized music and sound,
combat demos, a lifespan simulation). It produced the spec in [`docs/design-spec.md`](docs/design-spec.md).

**Phase 2: The game (in progress on the development branch).** Built to the approved plan in
[`docs/game-plan.md`](docs/game-plan.md), released to `main` in one piece when complete.

## The game

- **A life, season by season.** Seven origins and twelve constitutions; stats for Health, Body, Qi,
  Insight, Charm, Fame and Infamy, Wealth and Sanity; activities (train, meditate, seclusion, wander,
  work, study, physician, gamble, tavern, play); nine careers; aging, illness and death.
- **Cultivation.** Nine realms from Mortal to Life and Death, each with Early, Mid and Late stages;
  heart methods that set your pace and ceiling; hinted breakthrough odds; qi deviations that injure,
  cripple, madden or kill (and occasionally enlighten); seclusion for 1–30 years while the world moves on.
- **Combat.** A technique menu drawn from the arts you know, up to eight exchanges with bars instead of
  numbers, and every exit: flee, yield, talk, fight dirty, or use what you remember from a past life.
- **People.** Named characters who exist in every loop, plus generated ones; affection and respect;
  friends, rivals, sworn siblings, masters and disciples, courtship, marriage, children; tragedy and
  betrayal.
- **The world.** Orthodox sects, great families, the unorthodox, the Heavenly Demon Cult, the Imperial
  court and the merchant guilds, each with ranks, duties and reputation; a code-drawn map of the
  Central Plains with travel that takes seasons.
- **The wheel.** Every death returns you to age zero. A fixed timeline of history happens unless you
  change it; a codex of what you have learned (which fades over lives unless you annotate it); karmic
  burden; Heaven's growing attention as you change history; another regressor with their own plans;
  a Hall of Lives with titles, epitaphs and achievements.
- **Events.** Thousands of hand-written and templated events across daily life, fortuitous encounters,
  sect life, bonds, tournaments, the Gangho, history, war and the dark path, including letters and
  mini-games (meditation timing, forging, dice, riddles and examination essays).
- **Sound.** Generated music in the Yu mode on plucked strings, flute, bowed strings, bells and drums,
  adapting to the state of your life; ambience by place, season and weather; layered sound effects.
- **Saves.** Autosave every season plus five slots, all in browser storage, with export and import of
  everything as one file.
- **Settings.** Per-channel volume, text size, high contrast, reduced motion, childhood montage in later
  lives; keyboard play (N for next season, number keys for choices).

## Code layout

```
index.html                 game shell
manifest.webmanifest, sw.js  install and offline support (sw.js is stamped at deploy by tools/build-sw.js)
game/css/game.css          styles
game/img/icon.svg          app icon (drawn in code)
game/js/core/              RNG, text filling, storage and save format, helpers
game/js/engine/            game state and season pipeline, conditions, effects, event/codex registry
game/js/systems/           life, cultivation, combat, NPCs, bonds, world and travel, the wheel
game/js/content/           world, martial arts, realms, origins/items, names, named NPCs, timeline,
                           achievements, mini-game data
game/js/content/events/    all events (one file per theme; templates via template())
game/js/ui/                screens, panels, modals, art (SVG/canvas), sound director, settings
shared/audio/synth.js      Web Audio synthesis shared by the game and the design tool
design/                    the Phase 1 design tool
tools/lint.js              content linter (schema, cross-references, style, template uniqueness)
tools/sim.js               headless simulator that plays many lives with the real engine
docs/                      design spec and game plan
```

The engine never touches the DOM: it emits events that the UI listens to, so the simulator runs the
same code in Node.

## Development

No dependencies. With Node 20+:

```sh
node tools/lint.js                       # validate every event, template and timeline entry
node tools/sim.js --lives 200 --loops 3  # play lives headlessly; reports crashes and balance
```

`package.json` only marks `.js` files as ES modules for these tools.

## Deployment

`.github/workflows/pages.yml` runs on every push and pull request: it syntax-checks the JavaScript,
lints the content and simulates a few hundred lives. On `main` it then assembles the site (`index.html`,
the manifest and service worker, `game/`, `shared/`, `design/`, `docs/`), stamps the service worker with
the commit and its file list, and publishes to GitHub Pages.

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.

## Rules this project follows

- All art and audio are generated in code. No downloaded or third-party image or audio files.
- No libraries or frameworks without explicit approval. Plain HTML/CSS/JS.
- Saves live in browser storage, with export/import.

## License

MIT. See [LICENSE](LICENSE).
