# The Mortal Path

A BitLife-style text-and-menu life simulator set in a murim (Korean martial arts / wuxia) world.
Live one life year by year, cultivate qi, navigate the sects, and when you die, regress to childhood
with your memories. Meta-progression is knowledge of the world's timeline, not stat boosts.

The game is a static website hosted on GitHub Pages and written in plain HTML, CSS and JavaScript.
All graphics are SVG, CSS and canvas, and all sound is synthesized live with the Web Audio API.
There are no image or audio files in the repository.

## Status

**Phase 1: Design Trials (done).** `/design/` holds a gamified design questionnaire. It is a short murim
journey of twelve trials, one per design topic, and sealing trials raises your realm. Each trial has
cards, sliders, rankings and notes, with live previews: sample event text, a faction map, UI mockups,
synthesized music and sound, combat demos, and a lifespan simulation. At the end it generates a design
spec as Markdown and JSON.

**Phase 2: The game (not started).** It will be built from `docs/design-spec.md` once that exists.

## Playing / using it

- Live site: `https://origincli.github.io/the-mortal-path/` (after the first deploy from `main`)
- Design tool: `https://origincli.github.io/the-mortal-path/design/`

Run it locally with any static file server from the repository root:

```sh
python3 -m http.server 8000
# open http://localhost:8000/design/
```

The pages use ES modules, so they must be served over HTTP. Opening `file://` paths directly won't work.

## Design Trials

| # | Trial | Topic |
|---|-------|-------|
| 1 | The Brush and the Ink | Tone & writing style |
| 2 | Map of the Gangho | Setting & factions |
| 3 | The Dantian Awakens | Cultivation & realms |
| 4 | Crossing Blades | Combat |
| 5 | The Wheel Turns Back | Regression rules |
| 6 | Bonds of Blood and Oath | Relationships |
| 7 | Ten Thousand Fates | Event types |
| 8 | The Mortal Coil | Life systems, stats & activities |
| 9 | Silk and Lacquer | UI & visual style |
| 10 | Voice of the Strings | Audio style |
| 11 | Heaven's Severity | Difficulty |
| 12 | The First Step | Scope for the first playable version |

Answers are saved automatically in your browser's `localStorage`. On the final screen, *The Heavenly
Scroll*, you can:

- copy or download the spec as **Markdown** (`design-spec.md`, which also embeds the JSON) or **JSON**
  (`design-spec.json`)
- export your raw answers to a file and import them again later or on another device

The finished spec goes in the repo as [`docs/design-spec.md`](docs/).

### Code layout

```
index.html               landing page
design/index.html        design tool shell
design/css/design.css    styles
design/js/main.js        app shell: routing, header/realm, views, breakthrough overlay
design/js/trials.js      the twelve trials: questions, options and defaults (data only)
design/js/widgets.js     card / slider / rank / text / notes inputs
design/js/previews.js    live preview for each trial
design/js/art.js         SVG art: mountain path map, backdrops, seals, portraits, qi field
design/js/audio.js       Web Audio synthesis: instruments, ambience, themes, sound effects
design/js/spec.js        Markdown + JSON spec generation, export/import
design/js/state.js       defaults, persistence, validation
design/js/dom.js         tiny DOM / random helpers
```

## Deployment

`.github/workflows/pages.yml` deploys to GitHub Pages on every push to `main`, and can also be run by
hand from the Actions tab. It syntax-checks the JavaScript, assembles `index.html`, `design/` and `docs/`
into a site folder, and publishes it.

One-time setup: in **Settings → Pages**, set **Source** to **GitHub Actions**.

## Rules this project follows

- All art and audio are generated in code. No downloaded or third-party image or audio files.
- No libraries or frameworks without explicit approval. Plain HTML/CSS/JS.
- Saves live in browser storage, with export/import.

## License

MIT. See [LICENSE](LICENSE).
