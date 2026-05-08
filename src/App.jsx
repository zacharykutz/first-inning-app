import { useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import styles from './App.module.css'

export default function App() {
  const [view, setView] = useState('today')

  return (
    <div className={styles.app}>
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.brand}>
            <i className="ti ti-chart-bar" aria-hidden="true" />
            <span>First innings</span>
          </div>
          <div className={styles.navLinks}>
            <button
              className={`${styles.navBtn} ${view === 'today' ? styles.active : ''}`}
              onClick={() => setView('today')}
            >
              <i className="ti ti-calendar-event" aria-hidden="true" />
              Today
            </button>
            <button
              className={`${styles.navBtn} ${view === 'history' ? styles.active : ''}`}
              onClick={() => setView('history')}
            >
              <i className="ti ti-history" aria-hidden="true" />
              History
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.container}>
          {view === 'today' ? <Dashboard /> : <History />}
        </div>
      </main>
    </div>
  )
}
