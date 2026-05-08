import { useState } from 'react'
import { TODAY_GAMES, SUMMARY } from '../data/games.js'
import GameCard from '../components/GameCard.jsx'
import styles from './Dashboard.module.css'

const FILTERS = [
  { key: 'all',         label: 'All games'    },
  { key: 'strong-nrfi', label: 'Strong NRFI' },
  { key: 'lean-nrfi',   label: 'Lean NRFI'   },
  { key: 'tossup',      label: 'Toss-up'      },
  { key: 'yrfi',        label: 'YRFI lean'    },
]

function filterGames(games, key) {
  if (key === 'all') return games
  if (key === 'yrfi') return games.filter(g => g.edge === 'lean-yrfi' || g.edge === 'strong-yrfi')
  return games.filter(g => g.edge === key)
}

export default function Dashboard() {
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)

  const visible = filterGames(TODAY_GAMES, filter)

  function toggleDetail(id) {
    setOpenId(prev => (prev === id ? null : id))
  }

  function handleFilter(key) {
    setFilter(key)
    setOpenId(null)
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>First innings</h1>
        <div className={styles.datePill}>
          <i className="ti ti-calendar" aria-hidden="true" />
          Thu, May 7 · 2026
        </div>
      </div>

      <div className={styles.summaryBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Games today</div>
          <div className={styles.statValue}>{SUMMARY.totalGames}</div>
          <div className={styles.statSub}>candidates identified</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Strong NRFI edges</div>
          <div className={styles.statValue} style={{ color: 'var(--nrfi-strong-text)' }}>
            {SUMMARY.strongNrfi}
          </div>
          <div className={styles.statSub}>&gt;65% NRFI probability</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Strong YRFI edges</div>
          <div className={styles.statValue} style={{ color: 'var(--yrfi-lean-text)' }}>
            {SUMMARY.strongYrfi}
          </div>
          <div className={styles.statSub}>&gt;65% YRFI probability</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Season NRFI rate</div>
          <div className={styles.statValue}>{SUMMARY.leagueAvgNrfi}%</div>
          <div className={styles.statSub}>league avg baseline</div>
        </div>
      </div>

      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>Filter:</span>
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

      <div className={styles.gamesGrid}>
        {visible.map(game => (
          <GameCard
            key={game.id}
            game={game}
            isOpen={openId === game.id}
            onToggle={() => toggleDetail(game.id)}
          />
        ))}
      </div>
    </div>
  )
}
