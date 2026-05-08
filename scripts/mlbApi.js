/**
 * MLB Stats API fetch helpers.
 * All functions return parsed JSON or throw on failure.
 */

const BASE = 'https://statsapi.mlb.com/api/v1'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`MLB API ${res.status}: ${path}`)
  return res.json()
}

/** Today's schedule with probable pitchers and team info */
export async function fetchSchedule(date) {
  const data = await get(
    `/schedule?sportId=1&date=${date}&hydrate=probablePitcher,team,linescore`
  )
  const games = []
  for (const day of data.dates ?? []) {
    for (const game of day.games ?? []) {
      if (game.status?.abstractGameState === 'Preview' ||
          game.status?.abstractGameState === 'Live' ||
          game.status?.abstractGameState === 'Final') {
        games.push(game)
      }
    }
  }
  return games
}

/** 
 * Fetch probable pitchers from the boxscore endpoint as a fallback.
 * More reliable than the schedule hydration for same-day queries.
 */
export async function fetchProbablePitchers(gamePk) {
  try {
    const data = await get(`/game/${gamePk}/boxscore`)
    const away = data.teams?.away?.pitchers?.[0]
      ? await fetchPlayerInfo(data.teams.away.pitchers[0])
      : null
    const home = data.teams?.home?.pitchers?.[0]
      ? await fetchPlayerInfo(data.teams.home.pitchers[0])
      : null
    return { away, home }
  } catch {
    return { away: null, home: null }
  }
}

/** Fetch basic player info by ID */
async function fetchPlayerInfo(playerId) {
  try {
    const data = await get(`/people/${playerId}`)
    const p = data.people?.[0]
    if (!p) return null
    return {
      id: p.id,
      fullName: p.fullName,
      pitchHand: p.pitchHand,
    }
  } catch {
    return null
  }
}

/** Pitcher's game log for the season — returns array of split entries */
export async function fetchPitcherGameLog(pitcherId, season = 2026) {
  const data = await get(
    `/people/${pitcherId}?hydrate=stats(group=pitching,type=gameLog,season=${season})`
  )
  return data.people?.[0]?.stats?.[0]?.splits ?? []
}

/** Team's game log for the season — returns array of split entries */
export async function fetchTeamGameLog(teamId, season = 2026) {
  const data = await get(
    `/teams/${teamId}/stats?stats=gameLog&group=hitting&season=${season}`
  )
  return data.stats?.[0]?.splits ?? []
}

/** Linescore for a specific game — returns inning-by-inning breakdown */
export async function fetchLinescore(gamePk) {
  const data = await get(`/game/${gamePk}/linescore`)
  return data
}

/** Yesterday's completed games */
export async function fetchCompletedGames(date) {
  const data = await get(
    `/schedule?sportId=1&date=${date}&hydrate=probablePitcher,team,linescore`
  )
  const games = []
  for (const day of data.dates ?? []) {
    for (const game of day.games ?? []) {
      if (game.status?.abstractGameState === 'Final') {
        games.push(game)
      }
    }
  }
  return games
}
