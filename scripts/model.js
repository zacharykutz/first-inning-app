/**
 * NRFI scoring model.
 * Takes pitcher and team split data, returns nrfiPct + edge + confidence.
 */

const LEAGUE_AVG_NRFI = 0.58

/**
 * Confidence weight based on sample size.
 * Low N → lean heavily on league average.
 */
function confidenceWeight(n) {
  if (n >= 10) return 0.50
  if (n >= 5)  return 0.30
  return 0.10
}

export function confidenceTier(n) {
  if (n >= 10) return 'high'
  if (n >= 5)  return 'medium'
  return 'low'
}

/**
 * P(batting team does NOT score in 1st inning) for one side.
 * pitcherNrfiRate: fraction of SP starts with 0 runs allowed in 1st
 * teamOffenseRate: fraction of games where this team scored in 1st (we invert it)
 */
function sideNRFI(pitcherNrfiRate, pitcherN, teamScoredRate, teamN) {
  const teamNrfiRate = 1 - teamScoredRate
  const pw = confidenceWeight(pitcherN)
  const tw = 0.25
  const lw = 1 - pw - tw
  return (pw * pitcherNrfiRate) + (tw * teamNrfiRate) + (lw * LEAGUE_AVG_NRFI)
}

/**
 * Combined NRFI probability for the game.
 * NRFI = neither team scores in 1st inning.
 * Away bats top 1st vs home SP; home bats bottom 1st vs away SP.
 */
export function computeNRFI({
  awaySpNrfiRate, awaySpN,   // home SP facing away batters
  homeSpNrfiRate, homeSpN,   // away SP facing home batters
  awayBatScoredRate, awayBatN,
  homeBatScoredRate, homeBatN,
}) {
  // Away team bats vs home SP
  const awayScoreProb = sideNRFI(homeSpNrfiRate, homeSpN, awayBatScoredRate, awayBatN)
  // Home team bats vs away SP
  const homeScoreProb = sideNRFI(awaySpNrfiRate, awaySpN, homeBatScoredRate, homeBatN)

  const nrfi = awayScoreProb * homeScoreProb
  return Math.round(nrfi * 100)
}

/**
 * Edge label + key from NRFI percentage.
 */
export function getEdge(nrfiPct) {
  if (nrfiPct >= 68) return { edge: 'strong-nrfi', edgeLabel: 'Strong NRFI' }
  if (nrfiPct >= 60) return { edge: 'lean-nrfi',   edgeLabel: 'Lean NRFI'   }
  if (nrfiPct >= 53) return { edge: 'tossup',      edgeLabel: 'Toss-up'     }
  if (nrfiPct >= 45) return { edge: 'lean-yrfi',   edgeLabel: 'Lean YRFI'   }
  return               { edge: 'strong-yrfi', edgeLabel: 'Strong YRFI' }
}
