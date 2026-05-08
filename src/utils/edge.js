/**
 * Returns CSS variable names for a given edge key.
 * Keeps color logic in one place — update here when real data arrives.
 */
export function edgeColors(edge) {
  const map = {
    'strong-nrfi': { bg: 'var(--nrfi-strong-bg)', text: 'var(--nrfi-strong-text)' },
    'lean-nrfi':   { bg: 'var(--nrfi-lean-bg)',   text: 'var(--nrfi-lean-text)'   },
    'tossup':      { bg: 'var(--tossup-bg)',       text: 'var(--tossup-text)'      },
    'lean-yrfi':   { bg: 'var(--yrfi-lean-bg)',    text: 'var(--yrfi-lean-text)'   },
    'strong-yrfi': { bg: 'var(--yrfi-strong-bg)',  text: 'var(--yrfi-strong-text)' },
  }
  return map[edge] ?? map['tossup']
}

export function confidenceClass(conf) {
  return conf === 'high' ? 'high' : conf === 'medium' ? 'medium' : 'low'
}

export function confidenceIcon(conf) {
  return conf === 'high'
    ? 'ti-circle-check'
    : conf === 'medium'
    ? 'ti-circle-half'
    : 'ti-circle-dashed'
}
