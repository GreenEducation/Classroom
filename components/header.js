import Link from 'next/link'
import styles from './header.module.scss'

export default function Header({ name }) {

  return (
    <div className={styles.header}>
      <span className={styles.header__left}>
        <div className={styles.header__hamburger}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <Link href="/home"><a><h6>GreenEd</h6></a></Link>
      </span>
      <span>
        {name}
      </span>
    </div>
  )
}
