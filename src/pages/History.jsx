import { useState } from 'react'
import { HISTORY, HISTORY_DATE_KEYS } from '../data/history.js'
import { edgeColors } from '../utils/edge.js'
import styles from './History.module.css'

const FILTERS = [
  { key: 'all',    label: 'All games'    },
  { key: 'hit',    label: 'Hits only'    },
  { key: 'miss',   label: 'Misses only'  },
  { key: 'strong', label: 'Strong edges' },
]

function getStats(games) {
  const bets = games.filter(g => !g.nobet)
  const hits = bets.filter(g => g.hit).length
  const misses = bets.filter(g => !g.hit).length
  const nobets = games.filter(g => g.nobet).length
  const strong = games.filter(g => g.pred === 'strong-nrfi' || g.pred === 'strong-yrfi')
  const strongHits = strong.filter(g => g.hit === true).length
  const pct = bets.length > 0 ? Math.round((hits / bets.length) * 100) : 0
  const sPct = strong.length > 0 ? Math.round((strongHits / strong.length) * 100) : 0
  return { hits, misses, nobets, bets: bets.length, strong: strong.length, strongHits, pct, sPct }
}

function filterGames(games, key) {
  if (key === 'hit') return games.filter(g => g.hit === true)
  if (key === 'miss') return games.filter(g => g.hit === false)
  if (key === 'strong') return games.filter(g => g.pred === 'strong-nrfi' || g.pred === 'strong-yrfi')
  return games
}

function VerdictBadge({ nobet, hit }) {
  if (nobet) {
    return (
      <span className={`${styles.verdict} ${styles.nobet}`}>
        <i className="ti ti-minus" aria-hidden="true" />
        No bet
      </span>
    )
  }
  return hit ? (
    <span className={`${styles.verdict} ${styles.hit}`}>
      <i className="ti ti-check" aria-hidden="true" />
      Hit
    </span>
  ) : (
    <span className={`${styles.verdict} ${styles.miss}`}>
      <i className="ti ti-x" aria-hidden="true" />
      Miss
    </span>
  )
}

export default function History() {
  const [dayIdx, setDayIdx] = useState(0)
  const [filter, setFilter] = useState('all')

  const dateKey = HISTORY_DATE_KEYS[dayIdx]
  const games = HISTORY[dateKey]
  const stats = getStats(games)
  const visible = filterGames(games, filter)

  function handleFilter(key) { setFilter(key) }
  function prevDay() { if (dayIdx < HISTORY_DATE_KEYS.length - 1) setDayIdx(d => d + 1) }
  function nextDay() { if (dayIdx > 0) setDayIdx(d => d - 1) }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <i className="ti ti-history" aria-hidden="true" />
          Model history
        </h1>
        <div className={styles.dateNav}>
          <button className={styles.navBtn} onClick={prevDay}>
            <i className="ti ti-chevron-left" aria-hidden="true" />
          </button>
          <div className={styles.datePill}>{dateKey}</div>
          <button
            className={styles.navBtn}
            onClick={nextDay}
            disabled={dayIdx === 0}
            style={{ opacity: dayIdx === 0 ? 0.35 : 1 }}
          >
            <i className="ti ti-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.summaryBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Record</div>
          <div className={styles.statValue}>{stats.hits}–{stats.misses}</div>
          <div className={styles.statSub}>{stats.nobets} no bet</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hit rate</div>
          <div
            className={styles.statValue}
            style={{ color: stats.pct >= 60 ? 'var(--nrfi-strong-text)' : stats.pct >= 50 ? 'var(--tossup-text)' : 'var(--yrfi-strong-text)' }}
          >
            {stats.pct}%
          </div>
          <div className={styles.statSub}>{stats.hits}/{stats.bets} graded games</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Strong edges</div>
          <div
            className={styles.statValue}
            style={{ color: stats.sPct >= 65 ? 'var(--nrfi-strong-text)' : stats.sPct >= 50 ? 'var(--tossup-text)' : 'var(--yrfi-strong-text)' }}
          >
            {stats.strongHits}/{stats.strong}
          </div>
          <div className={styles.statSub}>{stats.sPct}% hit rate</div>
        </div>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>Show:</span>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`${styles.chip} ${filter === f.key ? styles.active : ''}`}
            onClick={() => handleFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.sectionHd}>{visible.length} game{visible.length !== 1 ? 's' : ''}</div>

      <div className={styles.colHeaders}>
        <div className={styles.colHd}>Matchup</div>
        <div className={styles.colHd}>Prediction</div>
        <div className={styles.colHd}>Outcome</div>
        <div className={`${styles.colHd} ${styles.right}`}>Result</div>
      </div>

      <div className={styles.resultList}>
        {visible.map((g, i) => {
          const { bg, text } = edgeColors(g.pred)
          return (
            <div key={i} className={`${styles.resultRow} ${g.nobet ? styles.dimmed : ''}`}>
              <div>
                <div className={styles.teams}>{g.teams}</div>
                <div className={styles.spLine}>{g.sp}</div>
              </div>
              <div>
                <div className={styles.colLabel}>Prediction</div>
                <span className={styles.predBadge} style={{ background: bg, color: text }}>
                  {g.predLabel}
                </span>
                <div className={styles.predPct}>{g.predPct}% NRFI</div>
              </div>
              <div>
                <div className={styles.colLabel}>Actual</div>
                <span className={`${styles.outBadge} ${styles[g.outcome]}`}>
                  {g.outcome.toUpperCase()}
                </span>
                <div className={styles.outScore}>{g.score}</div>
              </div>
              <div className={styles.verdictCol}>
                <VerdictBadge nobet={g.nobet} hit={g.hit} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
