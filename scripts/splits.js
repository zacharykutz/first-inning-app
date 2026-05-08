/**
 * Processes raw MLB game log splits into NRFI rates.
 * All functions work on the raw arrays returned by mlbApi.js.
 */

/**
 * From a pitcher's game log splits, compute first-inning NRFI stats.
 * The game log doesn't directly give per-inning runs, so we use
 * the linescore cache (built by fetchAllLinescores) to check inning 1.
 *
 * Returns: { nrfiCount, starts, nrfiRate, l10NrfiCount, l10Starts }
 */
export function pitcherNrfiStats(gameLog, linescoreCache, teamId) {
  // Only GS (game started) entries
  const starts = gameLog
    .filter(s => s.stat?.gamesStarted >= 1)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  let nrfiCount = 0
  let l10NrfiCount = 0
  const l10Starts = Math.min(starts.length, 10)

  for (let i = 0; i < starts.length; i++) {
    const gamePk = starts[i].game?.gamePk
    const linescore = linescoreCache[gamePk]
    if (!linescore) continue

    const inning1 = linescore.innings?.[0]
    if (!inning1) continue

    // Was this pitcher the home or away team?
    const isHome = starts[i].team?.id === teamId
    const runsAllowed = isHome ? inning1.away?.runs : inning1.home?.runs

    if (runsAllowed === 0) {
      nrfiCount++
      if (i < 10) l10NrfiCount++
    }
  }

  return {
    nrfiCount,
    starts: starts.length,
    nrfiRate: starts.length > 0 ? nrfiCount / starts.length : LEAGUE_AVG,
    l10NrfiCount,
    l10Starts,
    l10NrfiRate: l10Starts > 0 ? l10NrfiCount / l10Starts : LEAGUE_AVG,
  }
}

const LEAGUE_AVG = 0.58

/**
 * From a team's game log, compute how often they score in the 1st inning.
 * Uses linescore cache to check inning 1 runs for the batting team.
 *
 * Returns: { scoredCount, games, scoredRate, l10ScoredCount, l10Games }
 */
export function teamOffenseStats(gameLog, linescoreCache, teamId) {
  const games = gameLog
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  let scoredCount = 0
  let l10ScoredCount = 0
  const l10Games = Math.min(games.length, 10)

  for (let i = 0; i < games.length; i++) {
    const gamePk = games[i].game?.gamePk
    const linescore = linescoreCache[gamePk]
    if (!linescore) continue

    const inning1 = linescore.innings?.[0]
    if (!inning1) continue

    const isHome = games[i].isHome
    const runsScored = isHome ? inning1.home?.runs : inning1.away?.runs

    if (runsScored > 0) {
      scoredCount++
      if (i < 10) l10ScoredCount++
    }
  }

  return {
    scoredCount,
    games: games.length,
    scoredRate: games.length > 0 ? scoredCount / games.length : 1 - LEAGUE_AVG,
    l10ScoredCount,
    l10Games,
  }
}

/**
 * Format a fraction as "X/Y" string for display.
 */
export function frac(num, den) {
  return `${num}/${den}`
}

/**
 * Get the last start result and date for display.
 */
export function lastStartInfo(gameLog, linescoreCache, teamId) {
  const starts = gameLog
    .filter(s => s.stat?.gamesStarted >= 1)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  if (starts.length === 0) return { lastDate: '—', lastRes: 'nrfi' }

  const last = starts[0]
  const gamePk = last.game?.gamePk
  const linescore = linescoreCache[gamePk]
  const inning1 = linescore?.innings?.[0]

  const isHome = last.team?.id === teamId
  const runsAllowed = isHome ? inning1?.away?.runs : inning1?.home?.runs
  const opponent = last.opponent?.abbreviation ?? '?'
  const dateStr = last.date ? new Date(last.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'

  return {
    lastDate: `${dateStr} vs ${opponent}`,
    lastRes: runsAllowed === 0 ? 'nrfi' : 'yrfi',
  }
}
