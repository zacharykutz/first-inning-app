/**
 * update-games.js
 * Fetches today's MLB schedule, computes NRFI probabilities,
 * and writes src/data/games.js in the shape the React app expects.
 *
 * Usage: node scripts/update-games.js
 */

import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  fetchSchedule,
  fetchPitcherGameLog,
  fetchTeamGameLog,
  fetchLinescore,
} from './mlbApi.js'
import { computeNRFI, getEdge, confidenceTier } from './model.js'
import { pitcherNrfiStats, teamOffenseStats, frac, lastStartInfo } from './splits.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const LEAGUE_AVG_NRFI = 0.58

// ET offset — GitHub Actions runs in UTC
function getTodayET() {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const y = et.getFullYear()
  const m = String(et.getMonth() + 1).padStart(2, '0')
  const d = String(et.getDate()).padStart(2, '0')
  return `${m}/${d}/${y}`
}

function formatDateDisplay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatGameTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' EDT'
}

async function buildLinescoreCache(gamePks) {
  const cache = {}
  const results = await Promise.allSettled(
    gamePks.map(async pk => {
      const ls = await fetchLinescore(pk)
      cache[pk] = ls
    })
  )
  return cache
}

async function processPitcher(pitcherId, teamId, linescoreCache) {
  if (!pitcherId) return null
  try {
    const gameLog = await fetchPitcherGameLog(pitcherId)
    const stats = pitcherNrfiStats(gameLog, linescoreCache, teamId)
    const last = lastStartInfo(gameLog, linescoreCache, teamId)
    return { gameLog, stats, last }
  } catch (e) {
    console.warn(`Failed to fetch pitcher ${pitcherId}:`, e.message)
    return null
  }
}

async function processTeam(teamId, linescoreCache) {
  try {
    const gameLog = await fetchTeamGameLog(teamId)
    const stats = teamOffenseStats(gameLog, linescoreCache, teamId)
    return { gameLog, stats }
  } catch (e) {
    console.warn(`Failed to fetch team ${teamId}:`, e.message)
    return null
  }
}

async function main() {
  const today = getTodayET()
  console.log(`Fetching games for ${today}...`)

  const schedule = await fetchSchedule(today)
  console.log(`Found ${schedule.length} games`)

  if (schedule.length === 0) {
    console.log('No games today, writing empty data file')
    writeOutput([], today)
    return
  }

  // Collect all gamePks we'll need linescores for (for pitcher history)
  // We'll build this cache as we go per pitcher to avoid fetching too many at once
  const games = []
  let gameId = 1

  for (const game of schedule) {
    const awayTeam = game.teams?.away?.team
    const homeTeam = game.teams?.home?.team
    const awayPitcher = game.teams?.away?.probablePitcher
    const homePitcher = game.teams?.home?.probablePitcher

    console.log(`Processing ${awayTeam?.abbreviation} @ ${homeTeam?.abbreviation}...`)

    // Fetch pitcher game logs first to get all gamePks
    const [awayPitcherLog, homePitcherLog] = await Promise.all([
      awayPitcher ? fetchPitcherGameLog(awayPitcher.id).catch(() => []) : Promise.resolve([]),
      homePitcher ? fetchPitcherGameLog(homePitcher.id).catch(() => []) : Promise.resolve([]),
    ])

    const [awayTeamLog, homeTeamLog] = await Promise.all([
      fetchTeamGameLog(awayTeam.id).catch(() => []),
      fetchTeamGameLog(homeTeam.id).catch(() => []),
    ])

    // Collect all gamePks from pitcher logs and team logs
    const gamePks = new Set([
      ...awayPitcherLog.map(s => s.game?.gamePk).filter(Boolean),
      ...homePitcherLog.map(s => s.game?.gamePk).filter(Boolean),
      ...awayTeamLog.map(s => s.game?.gamePk).filter(Boolean),
      ...homeTeamLog.map(s => s.game?.gamePk).filter(Boolean),
    ])

    // Build linescore cache for this game's pitcher/team history
    console.log(`  Fetching ${gamePks.size} linescores...`)
    const linescoreCache = await buildLinescoreCache([...gamePks])

    // Compute pitcher stats
    const awaySpStats = awayPitcher
      ? pitcherNrfiStats(awayPitcherLog, linescoreCache, awayTeam.id)
      : { nrfiRate: LEAGUE_AVG_NRFI, starts: 0, l10NrfiRate: LEAGUE_AVG_NRFI, l10NrfiCount: 0, l10Starts: 0, nrfiCount: 0 }

    const homeSpStats = homePitcher
      ? pitcherNrfiStats(homePitcherLog, linescoreCache, homeTeam.id)
      : { nrfiRate: LEAGUE_AVG_NRFI, starts: 0, l10NrfiRate: LEAGUE_AVG_NRFI, l10NrfiCount: 0, l10Starts: 0, nrfiCount: 0 }

    // Compute team offense stats
    const awayBatStats = teamOffenseStats(awayTeamLog, linescoreCache, awayTeam.id)
    const homeBatStats = teamOffenseStats(homeTeamLog, linescoreCache, homeTeam.id)

    // Compute NRFI probability
    const nrfiPct = computeNRFI({
      awaySpNrfiRate: awaySpStats.nrfiRate,
      awaySpN: awaySpStats.starts,
      homeSpNrfiRate: homeSpStats.nrfiRate,
      homeSpN: homeSpStats.starts,
      awayBatScoredRate: awayBatStats.scoredRate,
      awayBatN: awayBatStats.games,
      homeBatScoredRate: homeBatStats.scoredRate,
      homeBatN: homeBatStats.games,
    })

    const { edge, edgeLabel } = getEdge(nrfiPct)

    // Confidence based on the weakest link (lowest SP sample)
    const minSpN = Math.min(awaySpStats.starts, homeSpStats.starts)
    const conf = confidenceTier(minSpN)
    const confN = `n=${minSpN}`
    const confDesc = awayPitcher && homePitcher
      ? `${awayPitcher.fullName?.split(' ')[1] ?? 'SP'}: ${awaySpStats.starts} starts, ${homePitcher.fullName?.split(' ')[1] ?? 'SP'}: ${homeSpStats.starts} starts`
      : 'probable pitcher not yet announced'

    // Last start info
    const awayLastStart = awayPitcher
      ? lastStartInfo(awayPitcherLog, linescoreCache, awayTeam.id)
      : { lastDate: '—', lastRes: 'nrfi' }
    const homeLastStart = homePitcher
      ? lastStartInfo(homePitcherLog, linescoreCache, homeTeam.id)
      : { lastDate: '—', lastRes: 'nrfi' }

    // Small sample warning
    let note = null
    if (!awayPitcher || !homePitcher) {
      const missing = !awayPitcher ? awayTeam.abbreviation : homeTeam.abbreviation
      note = `${missing} probable pitcher not yet announced`
    } else if (minSpN < 5) {
      note = `Small sample — ${awaySpStats.starts} and ${homeSpStats.starts} SP starts`
    }

    games.push({
      id: gameId++,
      gamePk: game.gamePk,
      awayAbbr: awayTeam.abbreviation,
      homeAbbr: homeTeam.abbreviation,
      awaySP: awayPitcher?.fullName ?? 'TBD',
      homeSP: homePitcher?.fullName ?? 'TBD',
      awayHand: awayPitcher?.pitchHand?.code === 'L' ? 'LHP' : 'RHP',
      homeHand: homePitcher?.pitchHand?.code === 'L' ? 'LHP' : 'RHP',
      time: formatGameTime(game.gameDate),
      park: game.venue?.name ?? '—',
      nrfiPct,
      awaySP_l10: frac(awaySpStats.l10NrfiCount, awaySpStats.l10Starts),
      awaySP_szn: frac(awaySpStats.nrfiCount, awaySpStats.starts),
      awayBat_l10: frac(awayBatStats.l10ScoredCount, awayBatStats.l10Games),
      homeSP_l10: frac(homeSpStats.l10NrfiCount, homeSpStats.l10Starts),
      homeSP_szn: frac(homeSpStats.nrfiCount, homeSpStats.starts),
      homeBat_l10: frac(homeBatStats.l10ScoredCount, homeBatStats.l10Games),
      edge,
      edgeLabel,
      ...(note && { note }),
      detail: {
        awaySpL10: frac(awaySpStats.l10NrfiCount, awaySpStats.l10Starts),
        awaySpSzn: frac(awaySpStats.nrfiCount, awaySpStats.starts),
        awaySpSplit: `On road: ${frac(awaySpStats.nrfiCount, awaySpStats.starts)}`,
        awaySplits: [
          ['vs RHB', '—'],
          ['vs LHB', '—'],
        ],
        awayLastDate: awayLastStart.lastDate,
        awayLastRes: awayLastStart.lastRes,
        homeSpL10: frac(homeSpStats.l10NrfiCount, homeSpStats.l10Starts),
        homeSpSzn: frac(homeSpStats.nrfiCount, homeSpStats.starts),
        homeSpSplit: `At home: ${frac(homeSpStats.nrfiCount, homeSpStats.starts)}`,
        homeSplits: [
          ['vs RHB', '—'],
          ['vs LHB', '—'],
        ],
        homeLastDate: homeLastStart.lastDate,
        homeLastRes: homeLastStart.lastRes,
        awayBatL10: frac(awayBatStats.l10ScoredCount, Math.min(awayBatStats.games, 10)),
        awayBatSzn: frac(awayBatStats.scoredCount, awayBatStats.games),
        awayBatSplit: `On road: ${frac(awayBatStats.l10ScoredCount, Math.min(awayBatStats.games, 10))}`,
        awayBatVsR: '—',
        awayBatVsL: '—',
        homeBatL10: frac(homeBatStats.l10ScoredCount, Math.min(homeBatStats.games, 10)),
        homeBatSzn: frac(homeBatStats.scoredCount, homeBatStats.games),
        homeBatSplit: `At home: ${frac(homeBatStats.l10ScoredCount, Math.min(homeBatStats.games, 10))}`,
        homeBatVsR: '—',
        homeBatVsL: '—',
        conf,
        confN,
        confDesc,
      },
    })
  }

  // Sort by time
  games.sort((a, b) => a.time.localeCompare(b.time))

  const summary = {
    totalGames: games.length,
    strongNrfi: games.filter(g => g.edge === 'strong-nrfi').length,
    strongYrfi: games.filter(g => g.edge === 'strong-yrfi').length,
    leagueAvgNrfi: Math.round(LEAGUE_AVG_NRFI * 100),
  }

  writeOutput(games, today, summary)
  console.log(`Done — wrote ${games.length} games`)
}

function writeOutput(games, today, summary = {}) {
  const displayDate = formatDateDisplay(
    new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York' })
  )

  const out = `// Auto-generated by update-games.js — ${new Date().toISOString()}
// Do not edit manually. Re-run the pipeline to refresh.

export const TODAY_GAMES = ${JSON.stringify(games, null, 2)}

export const SUMMARY = ${JSON.stringify({
    totalGames: summary.totalGames ?? 0,
    strongNrfi: summary.strongNrfi ?? 0,
    strongYrfi: summary.strongYrfi ?? 0,
    leagueAvgNrfi: summary.leagueAvgNrfi ?? 58,
    lastUpdated: new Date().toISOString(),
    dateDisplay: displayDate,
  }, null, 2)}
`

  const outPath = join(__dirname, '../src/data/games.js')
  writeFileSync(outPath, out)
  console.log(`Written to ${outPath}`)
}

main().catch(err => {
  console.error('Pipeline failed:', err)
  process.exit(1)
})
