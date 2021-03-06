import Link from 'next/link'
import styles from './sidebar.module.scss'

export default function Sidebar({ children }) {
  return (
    <div className={styles.sidebar}>
      <span className={styles.sidebar__top}>
      { children!='' ? children
      : <span>
          You are not enrolled in any courses.<br />
          <Link href="/add-course">+ Add a Course</Link>
        </span>
      }
      </span>
      <hr />
      <Link href="/chat"><a className={styles.sidebar__link}>Chat</a></Link>
      <Link href="/submission"><a className={styles.sidebar__link}>Submissions</a></Link>
      <Link href="/todo"><a className={styles.sidebar__link}>To Do</a></Link>
      <Link href="/grades"><a className={styles.sidebar__link}>Grades</a></Link>
      <Link href="/handouts"><a className={styles.sidebar__link}>Handouts</a></Link>
      <Link href="/settings"><a className={styles.sidebar__link}>Settings</a></Link>
    </div>
  )
}