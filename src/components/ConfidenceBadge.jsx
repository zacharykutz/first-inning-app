import { useState } from 'react'
import { confidenceIcon } from '../utils/edge.js'
import styles from './ConfidenceBadge.module.css'

const TIERS = [
  { cls: 'high',   icon: 'ti-circle-check',  label: 'High',   desc: 'n ≥ 10 starts' },
  { cls: 'medium', icon: 'ti-circle-half',   label: 'Medium', desc: 'n = 5–9 starts' },
  { cls: 'low',    icon: 'ti-circle-dashed', label: 'Low',    desc: 'n < 5 starts'   },
]

export default function ConfidenceBadge({ conf, confN, confDesc }) {
  const [open, setOpen] = useState(false)
  const icon = confidenceIcon(conf)

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className={`${styles.badge} ${styles[conf]}`}>
        <i className={`ti ${icon}`} aria-hidden="true" />
        {conf.charAt(0).toUpperCase() + conf.slice(1)} · {confN}
        <i className="ti ti-info-circle" aria-hidden="true" style={{ opacity: 0.5 }} />
      </div>

      {open && (
        <div className={styles.tooltip}>
          <div className={styles.tooltipTitle}>Confidence tiers</div>
          {TIERS.map(t => (
            <div key={t.cls} className={styles.tooltipRow}>
              <span className={`${styles.tier} ${styles[t.cls]}`}>
                <i className={`ti ${t.icon}`} aria-hidden="true" />
                {t.label}
              </span>
              <span className={styles.tierDesc}>{t.desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
