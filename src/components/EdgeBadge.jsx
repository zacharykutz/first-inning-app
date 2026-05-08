import { edgeColors } from '../utils/edge.js'
import styles from './EdgeBadge.module.css'

export default function EdgeBadge({ edge, label, size = 'sm' }) {
  const { bg, text } = edgeColors(edge)
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ background: bg, color: text }}
    >
      {label}
    </span>
  )
}
