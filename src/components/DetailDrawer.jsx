import { edgeColors } from '../utils/edge.js'
import ConfidenceBadge from './ConfidenceBadge.jsx'
import styles from './DetailDrawer.module.css'

function SPCard({ name, team, role, hand, l10, szn, split, splits, lastDate, lastRes }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className={styles.panelTitle}>{name}</div>
          <div className={styles.panelSub}>{team} · {role}</div>
        </div>
        <span className={styles.handBadge}>{hand}</span>
      </div>
      <div className={styles.statGrid}>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>L10</div>
          <div className={styles.statVal}>{l10}</div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>Season</div>
          <div className={styles.statVal}>{szn}</div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>{split.split(':')[0]}</div>
          <div className={styles.statVal}>{split.split(': ')[1]}</div>
        </div>
      </div>
      <hr className={styles.divider} />
      <table className={styles.splitTable}>
        <tbody>
          {splits.map(([label, val]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.lastStart}>
        <span>
          <i className="ti ti-calendar-event" aria-hidden="true" />
          Last · {lastDate}
        </span>
        <span className={`${styles.lastResult} ${styles[lastRes]}`}>
          {lastRes.toUpperCase()}
        </span>
      </div>
    </div>
  )
}

function BatCard({ team, role, l10, szn, split, vsR, vsL }) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className={styles.panelTitle}>{team} batters</div>
          <div className={styles.panelSub}>Scoring in 1st inning</div>
        </div>
      </div>
      <div className={styles.statGrid}>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>L10</div>
          <div className={styles.statVal}>{l10}</div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>Season</div>
          <div className={styles.statVal}>{szn}</div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>{split.split(':')[0]}</div>
          <div className={styles.statVal}>{split.split(': ')[1]}</div>
        </div>
      </div>
      <hr className={styles.divider} />
      <table className={styles.splitTable}>
        <tbody>
          <tr><td>vs RHP</td><td>{vsR}</td></tr>
          <tr><td>vs LHP</td><td>{vsL}</td></tr>
        </tbody>
      </table>
    </div>
  )
}

export default function DetailDrawer({ game }) {
  const { bg, text } = edgeColors(game.edge)
  const d = game.detail

  return (
    <div className={styles.drawer}>
      <div className={styles.drawerHeader}>
        <div>
          <div className={styles.drawerTitle}>{game.awayAbbr} @ {game.homeAbbr}</div>
          <div className={styles.drawerMeta}>
            <i className="ti ti-clock" aria-hidden="true" />
            {game.time} · {game.park}
          </div>
        </div>
        <div className={styles.drawerVerdict}>
          <div className={styles.drawerPct} style={{ color: text }}>{game.nrfiPct}%</div>
          <span className={styles.drawerPill} style={{ background: bg, color: text }}>
            {game.edgeLabel}
          </span>
          <div className={styles.drawerPctLabel}>NRFI probability</div>
        </div>
      </div>

      <div className={styles.drawerBody}>
        <div className={styles.sectionHd}>Starting pitchers · NRFI record</div>
        <div className={styles.twoCol}>
          <SPCard
            name={game.awaySP} team={game.awayAbbr} role="away SP" hand={game.awayHand}
            l10={d.awaySpL10} szn={d.awaySpSzn} split={d.awaySpSplit}
            splits={d.awaySplits} lastDate={d.awayLastDate} lastRes={d.awayLastRes}
          />
          <SPCard
            name={game.homeSP} team={game.homeAbbr} role="home SP" hand={game.homeHand}
            l10={d.homeSpL10} szn={d.homeSpSzn} split={d.homeSpSplit}
            splits={d.homeSplits} lastDate={d.homeLastDate} lastRes={d.homeLastRes}
          />
        </div>

        <div className={styles.sectionHd}>Team offence · 1st inning scoring</div>
        <div className={styles.twoCol}>
          <BatCard
            team={game.awayAbbr} role="away"
            l10={d.awayBatL10} szn={d.awayBatSzn} split={d.awayBatSplit}
            vsR={d.awayBatVsR} vsL={d.awayBatVsL}
          />
          <BatCard
            team={game.homeAbbr} role="home"
            l10={d.homeBatL10} szn={d.homeBatSzn} split={d.homeBatSplit}
            vsR={d.homeBatVsR} vsL={d.homeBatVsL}
          />
        </div>

        <div className={styles.modelBox}>
          <div className={styles.sectionHd} style={{ marginBottom: 0 }}>Model output</div>
          <div className={styles.modelGrid}>
            <div className={styles.modelSide}>
              <div className={styles.modelLabel}>NRFI</div>
              <div className={`${styles.modelPct} ${styles.nrfi}`}>{game.nrfiPct}%</div>
              <div className={styles.modelSub}>neither team scores</div>
            </div>
            <div className={styles.modelSide}>
              <div className={styles.modelLabel}>YRFI</div>
              <div className={`${styles.modelPct} ${styles.yrfi}`}>{100 - game.nrfiPct}%</div>
              <div className={styles.modelSub}>at least one run scores</div>
            </div>
          </div>
          <div className={styles.bar}>
            <div className={styles.barNrfi} style={{ width: `${game.nrfiPct}%` }} />
            <div className={styles.barYrfi} style={{ width: `${100 - game.nrfiPct}%` }} />
          </div>
          <div className={styles.confRow}>
            <span className={styles.confLabel}>Sample confidence · {d.confDesc}</span>
            <ConfidenceBadge conf={d.conf} confN={d.confN} confDesc={d.confDesc} />
          </div>
        </div>
      </div>
    </div>
  )
}
