# The Mortal Path: Plan for the Complete Game

This plan follows [`design-spec.md`](design-spec.md). It covers the complete game, built to the spec with
nothing left to add, delivered as one release.

## 1. The game in one paragraph

You are born in season one of year one, and every death sends you back to that same morning as an infant
who remembers. Each turn is a season. In each season you pick activities, react to events (about five a
year, many of them parts of multi-year stories), cultivate qi up the eight murim realms, fight
technique-menu duels, and build bonds that matter. The world has a fixed history: plagues, tournaments,
a Demonic Cult war, betrayals. You can bend that history with what you remember. Somewhere out there is
a second regressor who remembers too. The wheel never stops. You keep a journal and keep trying to make a
life worth living, and each life is about an hour of play.

## 2. Spec decisions this plan follows

| Area | Spec answer | How it shows up in the game |
|---|---|---|
| Voice | 2nd person, bittersweet, standard density, wry asides, teen rating | All event text and log lines; tested with a style linter (see §7) |
| Terms | Translated English, Korean murim setting | "Mount Hua Sect", "Namgung family", "senior brother", "Heavenly Demon"; Korean names |
| Log | Chronicle | "Year of the Wood Rat, Spring. Your 3rd year." headings |
| Factions | Orthodox, Five Families, Unorthodox, Cult, Court, Merchants (no Frontier) | All six playable or joinable, plus lone-wanderer; per-faction standing + Fame + Infamy |
| Cultivation | Murim ranks, Early/Mid/Late, measured pace, tense risk, all deviation outcomes, all paths, rare constitutions, seclusion 1–30 years | Full system, §4.4 |
| Combat | Technique menu, up to 8 exchanges, lethality 57, bars without numbers, poetic names, all fight kinds and exits | §4.5 |
| Regression | Every death → age 0, same day; carries timeline, secrets, theory, people, recipes; mostly fixed history but very changeable; rival regressor; fade + karmic burden + Heaven notices; codex + notes; endless | §4.8 |
| Bonds | All nine types, full romance, affection + respect, betrayal 26, tragedy 34 | §4.6 |
| Events | Daily life weighted highest, 5/year, saga chaining, 2–4 choices + unlocks, hinted odds, all formats and triggers | §5 |
| Life | 8 stats (no Luck, no Karma), 7 origins, 10 activities, 9 careers, lifespan by realm, seasons | §4.3 |
| Look | Ink & Parchment, phone-first column, classical serif, lavish ornament, flashy animation, English only (no Hanja) | §4.10 |
| Sound | All five instruments, adaptive music, Yu mode, 76 BPM, cinematic SFX, all ambience, on after first tap | §4.9 |
| Difficulty | Fair, dangerous roads, balanced agency, medium scarcity, four modes, fail forward, autosave + slots | §4.11 |
| Scope | Everything, 2,000 events, ~60-minute lives, phone first, one big release | §5, §8 |

## 3. Things in the spec that pull against each other, and what I propose

1. **Returning to age 0 every time vs. 60-minute lives.** Replaying infancy season by season every
   loop would get tedious. *Proposal:* life 1 plays childhood normally. In later lives, ages 0–5 run as
   a fast montage (a few lines per year), and the game stops only for events that are new to you or that
   you marked in your journal. You can turn this off.
2. **8 exchanges per fight vs. 60-minute lives and "regular" fights.** *Proposal:* duels are up to 8
   exchanges. After the first exchange you can let the fight resolve itself, and it plays out in prose
   using your stance. Important fights (nemeses, tournaments, the Cult war) don't offer the shortcut.
3. **"No Hanja" vs. seal stamps.** Seals become red stamps with English words and drawn sigils, never
   characters. The design tool keeps its Hanja; only the game is English-only.
4. **Flashy animation vs. readability first.** Motion goes on transitions, breakthroughs, combat and
   backdrops, never on text the player is reading. There's a Motion setting
   (Full / Reduced / Off), and the OS reduced-motion preference is honored.
5. **Endless wheel vs. long-term motivation.** With no ending, the goals are the **Hall of Lives** (every
   past life with its titles and epitaph), achievements ("Saved Mount Hua", "Became Heavenly Demon",
   "Lived to 300"), codex completion, and the rival regressor's story, which resolves differently in each
   life but never ends the wheel.
6. **"Broad & rough" vs. "complete, nothing left to add".** The Phase 2 brief wins: every system is
   finished and polished before release.
7. **2,000 events.** See §5.3. This is the biggest piece of work and the one decision I'd like you to
   confirm.

## 4. Systems

### 4.1 Architecture (plain JS, no libraries)

```
index.html               the game (the landing page moves into the game's title screen)
design/                  Design Trials (kept; reads shared/ for audio)
shared/audio/            synth engine (moved out of design/), music director, ambience
game/css/                styles
game/js/core/            rng (seeded), clock (seasons), state, save/meta-save, event bus, settings
game/js/systems/         life, health, cultivation, combat, relations, npcs, factions, careers,
                         travel, timeline, events, regression, codex, achievements, difficulty
game/js/content/         events/<category>/*.js, sagas/, timeline.js, npcs.js, factions.js,
                         locations.js, manuals.js, techniques.js, items.js, origins.js,
                         constitutions.js, careers.js, text/ (name lists, phrase banks)
game/js/ui/              screens and components (log, event modal, combat, menus, map, journal…)
game/js/art/             backdrops, weather, portraits (aging), vignettes, seals, particles, transitions
tools/                   content linter, headless life simulator, text style checker (Node, no deps)
docs/                    spec, this plan, content guide
```

The rule: `core/`, `systems/` and `content/` never touch the DOM, so the whole game can run headless in
Node for testing and balancing. The UI reads state and dispatches actions.

### 4.2 Saves

- **Life saves:** autosave every turn, plus 5 manual slots (the spec says "freedom to branch lives").
  One Life mode uses a single save and allows no branching.
- **Meta save (the wheel):** codex, personal notes, Hall of Lives, achievements, loop count, Heaven's
  attention. It is kept separately so regression never depends on a slot.
- Export/import of everything as one file, versioned with migrations.
- Everything in `localStorage`, guarded, with a warning if storage is blocked.

### 4.3 Life

- **Birth:** one of 7 origins, and a constitution rolled from ~12 (Nine Yin Absolute Meridians,
  Heaven-Spurned Body, Pure Yang Body… some cursed, many ordinary).
  Family and siblings are generated per origin.
- **Stats:** Health, Body, Qi, Insight, Charm, Fame/Infamy, Wealth (taels), Sanity/Heart-demon.
- **Seasons:** 4 turns per year. Season affects events, weather, travel, harvests and illness.
- **Activities (10):** train, meditate, seclusion, wander, work, study, physician, gamble, tavern
  rumors, read journal. A limited number of actions per season, so choosing is the core loop
  (your #1 ranked everyday priority).
- **Careers (9):** escort guard, merchant, physician, blacksmith, scholar-official (exams), bandit,
  assassin, information broker, farmer. Each has ranks, income and its own events.
- **Aging and death:** lifespan grows with realm (about 70 for a mortal, centuries at the top). Death
  can come from illness, violence, qi deviation, execution, old age, disaster or assassination.

### 4.4 Cultivation

- 8 realms × Early/Mid/Late. The Late→next step is a bottleneck that needs a breakthrough attempt.
- Progress comes from meditation, manuals, masters, elixirs, enlightenment events, seclusion and
  forbidden qi absorption.
- **Paths:** orthodox, unorthodox, demonic, external body arts, medicine & poison. Each has its own
  speed, risk, reputation effects and techniques.
- **Breakthroughs:** odds are hinted ("you feel ready", "your foundation is shaky"). Failure is
  fail-forward: injury, crippled meridians (which opens the poison or external-arts path), madness
  (Heart-demon, demonic whispers), death, or rare twisted insight.
- **Seclusion:** choose 1–30 years. You come out to a changed world, with summarized news, people who
  aged or died, and history that may have moved on without you.
- **Manuals:** about 60 martial manuals and arts (sect arts, family arts, lost scriptures, demonic
  canons). The memory of a manual carries over between lives, but your body has to be retrained.

### 4.5 Combat

- Turn-based technique menu; each technique costs qi. You get techniques from the manuals you've learned.
- Up to 8 exchanges, with health and qi bars (no numbers), and poetic technique names in cinematic
  second-person prose.
- Enemies are built from realm, faction, path and personality, with signature techniques.
- **Exits:** flee (lightness check), yield (lose face), talk (Charm/Insight), dirty tricks (Infamy),
  and foreknowledge (an option that only appears if you remember this enemy from a past life).
- **Fight kinds:** honor duels, ambushes, tournaments (bracketed, multi-round), sparring (non-lethal),
  sect wars (a sequence of fights with outcomes for the war), assassinations, and beasts.
- **Lethality 57:** losing usually means injury and consequences, sometimes death.

### 4.6 Relationships

- Persistent NPCs per life. About 120 hand-written named characters appear in every loop (the people
  your memory is about), plus generated characters.
- Affection and Respect meters, depth "characterful": each key character has wants, fears, a personal
  arc, and dialogue that reacts to your history.
- The full interaction menu (10 actions), with a context menu per bond type.
- Courtship, marriage, children and heirs (family legacy is your #2 bond).
- Masters and disciples, sworn siblings, rivals, and nemeses (blood feuds that remember across loops
  if you were the cause).
- Tragedy 34 and betrayal 26: loss and treachery are real but not constant.

### 4.7 World, factions and travel

- **Factions:**
  - Nine Great Sects under the Murim Alliance
  - Five Great Families
  - Unorthodox (Black Path, Green Forest, Water Fortresses, an assassins' guild)
  - the Heavenly Demon Divine Cult, as a complex faction with internal factions
  - the Imperial Court (Eastern Depot, officials)
  - merchant and information guilds
- **Membership:** joining, rank within the faction, duties, politics, expulsion.
- **Reputation:** per-faction standing plus Fame and Infamy.
- **Map:** a code-drawn map of about 24 locations across 8 regions. Travel takes seasons, roads are
  dangerous, and each place has its own backdrop, ambience and event pool.

### 4.8 Regression, timeline and memory

- **World timeline:** about 80 fixed historical events over 200 years. Each one happens unless your
  flags prevent or change it. Determinism 25 adds small variations; butterfly 65 means your changes
  spread through the world in real ways.
- **What carries over:** timeline knowledge, secrets and locations, martial theory (insight bonus for
  arts you remember), knowledge of people, and recipes and crafts. Stats never carry over.
- **Codex + notes:** discoveries are logged automatically, and you can annotate any entry or write
  free notes. "Read memory journal" is an activity.
- **Memories fade:** entries from older loops blur (details hidden) unless you confirm them again in a
  later life or wrote them into your own notes.
- **Karmic burden:** each death adds to Heart-demon at the start of the next life, and too much risks
  madness.
- **Heaven notices:** the more history you change, the harsher the world gets (more ambushes, the rival
  regressor adapts), up to a cap.
- **The other regressor:** a hand-written arc spread over many loops. Who they are, what they want, and
  whether you are rivals, allies or lovers is the deepest mystery in the game.
- **Hall of Lives:** your past lives, each with a title, an epitaph and its achievements.

### 4.9 Audio (all synthesized)

- **Music director:** picks a mood (peace, wonder, tension, danger, sorrow, triumph) from game state.
  It crossfades generated Yu-mode music at 76 BPM using all five instruments, and drums swell in danger.
- **Ambience:** chosen by location, season and weather (wind, rain, birds, fire, temple).
- **Effects:** layered cinematic SFX for every action, as you asked.
- **Restraint while reading:** music ducks while an event is open.
- **Controls:** volume per channel (music, ambience, effects). Sound starts on the first tap.

### 4.10 Visuals (all code-drawn)

- **Look:** Ink & Parchment palette, a phone-first column centered on desktop, classical serif type,
  lavish ornament (borders, cloud corners, scroll rods, seal stamps).
- **Backdrops:** ink-wash, per region and season, with weather (rain, snow, petals, mist).
- **Portraits:** generated faces for you and named NPCs that age over the years, with origin and
  faction attire.
- **Scenes:** about 40 vignettes for major events (cliff caves, burning sects, tournament stages,
  weddings, the wheel turning).
- **Motion:** qi particles that thicken with realm, and flashy breakthrough, death and regression
  transitions.
- **Accessibility:** text size setting, high-contrast option, screen-reader friendly log, keyboard
  play on desktop, and large touch targets.

### 4.11 Difficulty and modes

| Mode | What changes |
|---|---|
| Wanderer | Lower death rates, clearer odds hints |
| Martial Artist | The intended game, with the spec's slider values |
| Heavenly Tribulation | Harsher odds, scarcer pills, more ambushes |
| One Life | No regression; one save |

Balance targets are checked by the simulator (§7): Fair overall, with a "Dangerous" Gangho.

## 5. Events

### 5.1 Data shape

Each event is a plain JS object:

- `id`, `category`, `weight`
- `when`: age, season, world-year, location, realm, stats, flags, faction standing, relationships,
  memories, chance
- `text` (with variants)
- `choices`: each choice has requirements, hint text, and an unlock condition (stats, flags, or past-life
  memories)
- `outcomes`: stat changes, flags set or cleared, relationship changes, reputation, items, techniques,
  codex entries, scheduled follow-ups ("in 2 years"), combat, travel, death
- `remember`: codex entries this event creates

Chains are built from flags plus scheduled follow-ups, which is how saga-length arcs work. The content
linter (§7) checks every reference.

### 5.2 Formats

All five formats you picked:

- choice prompts
- log-only beats
- illustrated vignettes
- letters
- mini-games (meditation timing, gambling dice, riddles, exam essays, forging)

### 5.3 The 2,000-event count (needs your call)

At 5 events a year, a 70-year life sees about 350 events, and a master who lives centuries sees many
more. 2,000 is the right size. I recommend counting it like this:

- **About 900 hand-written events.** These include about 60 sagas of 4–15 linked events, the timeline,
  the rival-regressor arc, faction storylines, romance and family arcs, and the key characters.
- **About 1,100 events built from about 150 authored templates.** Each template is written by hand with
  several prose variants and is filled in with the NPC, place, season, faction and stakes, for example
  "a merchant's caravan is attacked on the {road}". Each counts as an event only when it has its own
  outcome logic.

Writing all 2,000 entirely by hand is possible, but it would take much longer, and the everyday "daily
life" events would gain little from it.

Planned split, following your category ranking:

| Daily | Fortuitous | Sect | Bonds | Tournament | Gangho | Timeline | War | Crime |
|---|---|---|---|---|---|---|---|---|
| ~480 | ~340 | ~260 | ~230 | ~170 | ~160 | ~140 | ~120 | ~100 |

## 6. Build order (your ranking, internal milestones, one release)

1. Foundations: core engine, saves, seasons, shell UI, chronicle log, Age Up
2. Event engine, formats, linter and simulator
3. Life systems: origins, stats, activities, careers, health, death
4. Cultivation and seclusion
5. Combat
6. Relationships, romance, family
7. Factions, sects, reputation, map and travel
8. Regression, timeline, codex, rival regressor, Hall of Lives, modes
9. Audio: music director and ambience
10. Art polish: backdrops, weather, portraits, vignettes, transitions
11. Content: 2,000 events (written alongside each system, finished here)
12. Balance (simulator-driven), accessibility, onboarding, performance, README

I commit in small steps to the working branch throughout. Because you chose one big release, nothing
merges to `main` (and so nothing goes live) until the end. If you want to peek earlier, just ask.

## 7. Quality checks (Node built-ins only, no new libraries)

- **Content linter:** schema errors, missing flags and events, unreachable events, dead-end chains, and
  references to the wrong category.
- **Headless simulator:** plays thousands of lives with the real engine and reports crashes, stuck
  states, lifespan and realm distributions, event coverage, repetition rates and play-time estimates.
  These numbers are what the tuning targets.
- **Style checker:** second person, no Hanja, flags overlong text.
- **CI:** linter + a 500-life simulation run before every deploy.
- **Browser checks:** Playwright runs locally in my environment, used for UI smoke tests and
  screenshots. It is not added to the repo.
- **Housekeeping:** update GitHub Actions to current versions (Node 20 deprecation warning).

## 8. What "done" means

Every system in §4 is complete and wired into the event content. There are 2,000 events (split per
§5.3). The linter and simulator are clean, and simulated play-time is close to 60 minutes per life on
Martial Artist. Play works on a phone with no layout breakage, offline after first load. The README is
updated and the game is deployed to GitHub Pages.
