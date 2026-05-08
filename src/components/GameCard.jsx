import { edgeColors } from '../utils/edge.js'
import DetailDrawer from './DetailDrawer.jsx'
import styles from './GameCard.module.css'

export default function GameCard({ game, isOpen, onToggle }) {
  const { bg, text } = edgeColors(game.edge)

  return (
    <div id={`card-${game.id}`}>
      <div className={`${styles.card} ${isOpen ? styles.active : ''}`}>
        <div className={styles.cardTop}>
          <div className={styles.matchup}>
            <div className={styles.teamBlock}>
              <div className={styles.teamAbbr}>{game.awayAbbr}</div>
              <div className={styles.teamSP}>{game.awaySP.split(' ').pop()} · {game.awayHand}</div>
            </div>
            <span className={styles.at}>@</span>
            <div className={styles.teamBlock}>
              <div className={styles.teamAbbr}>{game.homeAbbr}</div>
              <div className={styles.teamSP}>{game.homeSP.split(' ').pop()} · {game.homeHand}</div>
            </div>
          </div>

          <div className={styles.scoreBadge}>
            <div className={styles.nrfiPct} style={{ color: text }}>{game.nrfiPct}%</div>
            <span className={styles.edgePill} style={{ background: bg, color: text }}>
              {game.edgeLabel}
            </span>
          </div>
        </div>

        <div className={styles.splitsRow}>
          <div className={styles.splitBlock}>
            <div className={styles.spName}>{game.awayAbbr} · {game.awaySP.split(' ').pop()}</div>
            <div className={styles.miniStats}>
              <div className={styles.miniStat}>
                <div className={styles.msLabel}>SP L10</div>
                <div className={styles.msVal}>{game.awaySP_l10}</div>
              </div>
              <div className={styles.miniStat}>
                <div className={styles.msLabel}>SP szn</div>
                <div className={styles.msVal}>{game.awaySP_szn}</div>
              </div>
              <div className={styles.miniStat}>
                <div className={styles.msLabel}>Bat L10</div>
                <div className={styles.msVal}>{game.awayBat_l10}</div>
              </div>
            </div>
          </div>
          <div className={styles.splitBlock}>
            <div className={styles.spName}>{game.homeAbbr} · {game.homeSP.split(' ').pop()}</div>
            <div className={styles.miniStats}>
              <div className={styles.miniStat}>
                <div className={styles.msLabel}>SP L10</div>
                <div className={styles.msVal}>{game.homeSP_l10}</div>
              </div>
              <div className={styles.miniStat}>
                <div className={styles.msLabel}>SP szn</div>
                <div className={styles.msVal}>{game.homeSP_szn}</div>
              </div>
              <div className={styles.miniStat}>
                <div className={styles.msLabel}>Bat L10</div>
                <div className={styles.msVal}>{game.homeBat_l10}</div>
              </div>
            </div>
          </div>
        </div>

        {game.note && (
          <div className={styles.note}>
            <i className="ti ti-alert-circle" aria-hidden="true" />
            {game.note}
          </div>
        )}

        <div className={styles.cardFooter}>
          <span className={styles.gameTime}>
            <i className="ti ti-clock" aria-hidden="true" />
            {game.time} · {game.park}
          </span>
          <button className={`${styles.detailBtn} ${isOpen ? styles.open : ''}`} onClick={onToggle}>
            {isOpen ? 'Close' : 'Details'}
            <i className={`ti ${isOpen ? 'ti-chevron-up' : 'ti-chevron-down'}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isOpen && <DetailDrawer game={game} />}
    </div>
  )
}
