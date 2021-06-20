import Link from 'next/link'
import styles from './sidebar.module.scss'

export default function Sidebar({ children }) {
  return (
    <div className={styles.sidebar}>
      { children }
      <Link href="course"><a className={styles.sidebar__link}>Math 138</a></Link>
      <Link href="course"><a className={styles.sidebar__link}>Math 237</a></Link>
      <Link href="course"><a className={styles.sidebar__link}>CS 246</a></Link>
      <Link href="course"><a className={styles.sidebar__link}>Psych 245</a></Link>
      <hr />
      <Link href="chat"><a className={styles.sidebar__link}>Chat</a></Link>
      <Link href="submission"><a className={styles.sidebar__link}>Submissions</a></Link>
      <Link href="todo"><a className={styles.sidebar__link}>To Do</a></Link>
      <Link href="grades"><a className={styles.sidebar__link}>Grades</a></Link>
      <Link href="handouts"><a className={styles.sidebar__link}>Handouts</a></Link>
      <Link href="settings"><a className={styles.sidebar__link}>Settings</a></Link>
    </div>
  )
}