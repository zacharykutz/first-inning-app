/**
 * Mock historical results data.
 * Shape mirrors what the real pipeline will write after each game day completes.
 *
 * Each game result:
 *   teams, sp, pred (edge key), predLabel, predPct (NRFI %),
 *   outcome ('nrfi' | 'yrfi'), score, nobet (bool), hit (bool | null)
 */

export const HISTORY = {
  'Wed, May 6': [
    { teams: 'LAD @ SF',    sp: 'Glasnow vs Webb',      pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 74, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'PIT @ ARI',   sp: 'Falter vs Kelly',      pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 71, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'STL @ SD',    sp: 'Mikolas vs Cease',     pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 68, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'HOU @ SEA',   sp: 'Valdez vs Castillo',   pred: 'lean-nrfi',   predLabel: 'Lean NRFI',   predPct: 66, outcome: 'yrfi', score: '1-0 HOU after 1st',   nobet: false, hit: false },
    { teams: 'ATH @ PHI',   sp: 'Sears vs Suárez',      pred: 'lean-nrfi',   predLabel: 'Lean NRFI',   predPct: 63, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'CIN @ MIL',   sp: 'Lodolo vs Peralta',    pred: 'tossup',      predLabel: 'Toss-up',     predPct: 58, outcome: 'yrfi', score: '1-0 MIL after 1st',   nobet: true,  hit: null  },
    { teams: 'TB @ BOS',    sp: 'Jax vs Bennett',       pred: 'tossup',      predLabel: 'Toss-up',     predPct: 55, outcome: 'nrfi', score: '0-0 after 1st',       nobet: true,  hit: null  },
    { teams: 'NYM @ NYY',   sp: 'Montas vs Cole',       pred: 'lean-yrfi',   predLabel: 'Lean YRFI',   predPct: 38, outcome: 'yrfi', score: '2-0 NYY after 1st',   nobet: false, hit: true  },
    { teams: 'CHC @ COL',   sp: 'Steele vs Gomber',     pred: 'strong-yrfi', predLabel: 'Strong YRFI', predPct: 29, outcome: 'yrfi', score: '3-1 after 1st',       nobet: false, hit: true  },
  ],
  'Tue, May 5': [
    { teams: 'SF @ SD',     sp: 'Webb vs Cease',        pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 76, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'CLE @ DET',   sp: 'Bibee vs Skubal',      pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 73, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'NYY @ BOS',   sp: 'Schmidt vs Sale',      pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 72, outcome: 'yrfi', score: '1-0 BOS after 1st',   nobet: false, hit: false },
    { teams: 'ATL @ PHI',   sp: 'Morton vs Wheeler',    pred: 'lean-nrfi',   predLabel: 'Lean NRFI',   predPct: 62, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'HOU @ TEX',   sp: 'Valdez vs Eovaldi',    pred: 'lean-nrfi',   predLabel: 'Lean NRFI',   predPct: 61, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'CHC @ MIL',   sp: 'Steele vs Peralta',    pred: 'tossup',      predLabel: 'Toss-up',     predPct: 54, outcome: 'nrfi', score: '0-0 after 1st',       nobet: true,  hit: null  },
    { teams: 'SEA @ LAA',   sp: 'Castillo vs Detmers',  pred: 'lean-yrfi',   predLabel: 'Lean YRFI',   predPct: 41, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: false },
    { teams: 'MIN @ CLE',   sp: 'Gray vs Bibee',        pred: 'lean-nrfi',   predLabel: 'Lean NRFI',   predPct: 64, outcome: 'yrfi', score: '1-0 CLE after 1st',   nobet: false, hit: false },
    { teams: 'LAD @ COL',   sp: 'Glasnow vs Freeland',  pred: 'strong-yrfi', predLabel: 'Strong YRFI', predPct: 27, outcome: 'yrfi', score: '2-0 LAD after 1st',   nobet: false, hit: true  },
  ],
  'Mon, May 4': [
    { teams: 'NYM @ ATL',   sp: 'Quintana vs Morton',   pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 69, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'CLE @ DET',   sp: 'Bibee vs Skubal',      pred: 'strong-nrfi', predLabel: 'Strong NRFI', predPct: 73, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'MIL @ STL',   sp: 'Peralta vs Mikolas',   pred: 'lean-nrfi',   predLabel: 'Lean NRFI',   predPct: 65, outcome: 'nrfi', score: '0-0 after 1st',       nobet: false, hit: true  },
    { teams: 'TOR @ TB',    sp: 'Berríos vs Jax',       pred: 'lean-nrfi',   predLabel: 'Lean NRFI',   predPct: 60, outcome: 'yrfi', score: '1-0 TOR after 1st',   nobet: false, hit: false },
    { teams: 'TEX @ HOU',   sp: 'Eovaldi vs Valdez',    pred: 'tossup',      predLabel: 'Toss-up',     predPct: 57, outcome: 'nrfi', score: '0-0 after 1st',       nobet: true,  hit: null  },
    { teams: 'COL @ LAD',   sp: 'Gomber vs Glasnow',    pred: 'strong-yrfi', predLabel: 'Strong YRFI', predPct: 25, outcome: 'yrfi', score: '4-2 after 1st',       nobet: false, hit: true  },
  ],
}

export const HISTORY_DATE_KEYS = Object.keys(HISTORY)
