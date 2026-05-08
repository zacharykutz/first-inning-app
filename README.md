# First Inning App

MLB first-inning NRFI/YRFI analysis tool. Shows today's games with model probability scores, full pitcher and team splits, and a historical accuracy tracker.

Built with Vite + React, deployable to GitHub Pages.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173/first-inning-app/

---

## Deploy to GitHub Pages

### One-time setup

1. Push this repo to GitHub (e.g. `github.com/yourname/first-inning-app`)

2. In your repo settings → **Pages** → set source to **GitHub Actions**

3. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

4. Your app will be live at `https://yourname.github.io/first-inning-app/`

> **Important:** If your repo name differs from `first-inning-app`, update `base` in `vite.config.js` to match:
> ```js
> base: '/your-repo-name/',
> ```

---

## Project structure

```
src/
  data/
    games.js          # Today's games mock data  ← replace with real API output
    history.js        # Historical results mock   ← replace with real API output
  utils/
    edge.js           # Edge color + confidence helpers
  components/
    GameCard.jsx      # Dashboard game card
    DetailDrawer.jsx  # Expanded splits + model output
    ConfidenceBadge.jsx
    EdgeBadge.jsx
  pages/
    Dashboard.jsx     # Today's games view
    History.jsx       # Historical results view
  App.jsx             # Nav + view switcher
  index.css           # CSS variables + base styles
```

---

## Data pipeline (Phase 2)

The app currently uses static mock data in `src/data/`. The next phase is wiring in real MLB data.

### Data sources

| What | Endpoint |
|---|---|
| Today's schedule + probable pitchers | `GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&date={date}&hydrate=probablePitcher,team` |
| Pitcher game log (season) | `GET https://statsapi.mlb.com/api/v1/people/{id}?hydrate=stats(group=pitching,type=gameLog,season=2026)` |
| Per-game linescore (1st inning runs) | `GET https://statsapi.mlb.com/api/v1/game/{gamePk}/linescore` |

### Pipeline steps

1. Fetch today's schedule → extract `gamePk`, `teams`, `probablePitcher.id` for each game
2. For each probable pitcher → fetch their 2026 game log → collect `gamePk` list
3. For each `gamePk` in the pitcher's log → fetch linescore → read `innings[0].home.runs` / `innings[0].away.runs`
4. Compute NRFI rates: pitcher as SP + opposing team as batters
5. Run scoring model → produce `nrfiPct` and `edge` per game
6. Write output to `src/data/games.js` (today) and append to `src/data/history.js` (after games complete)

### Scoring model

```js
// Each "side": P(batting team scores 0 in 1st)
// Weights sum to 1.0; low-sample pitchers lean toward leagueAvg (0.58)
function sideNRFI(pitcherRate, pitcherN, teamOffenseRate, teamN) {
  const pitcherWeight = confidenceWeight(pitcherN)   // 0.0–0.5
  const teamWeight    = 0.3
  const leagueWeight  = 1 - pitcherWeight - teamWeight
  return pitcherWeight * pitcherRate
       + teamWeight    * teamOffenseRate
       + leagueWeight  * 0.58
}

// NRFI = neither side scores
function gameNRFI(awayBatsVsHomeSP, homeBatsVsAwaySP) {
  return awayBatsVsHomeSP * homeBatsVsAwaySP
}
```

### Edge thresholds

| NRFI % | Edge |
|---|---|
| ≥ 68% | Strong NRFI |
| 60–67% | Lean NRFI |
| 53–59% | Toss-up (no bet) |
| 45–52% | Lean YRFI |
| ≤ 44% | Strong YRFI |

### Confidence tiers

| Tier | SP starts |
|---|---|
| High | n ≥ 10 |
| Medium | n = 5–9 |
| Low | n < 5 |

Low confidence games blend heavily toward the 58% league average.

---

## Suggested Claude Code session (Phase 2)

Open Claude Code in this repo folder and say:

> "Build the data pipeline for this NRFI app. Use the MLB Stats API to fetch today's schedule, pitcher game logs, and per-game linescores to compute real NRFI rates. Write the output to `src/data/games.js` in the same shape as the existing mock data. See README for endpoint details and the scoring model."

Claude Code will have full context from the existing file structure and this README.
