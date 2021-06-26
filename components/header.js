import styles from './header.module.scss'

export default function Header() {

  return (
    <div className={styles.header}>
      <span>
        <div className={styles.header__hamburger}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </span>
      <span>
        <a href="/api/auth/login">Login</a>
      </span>
    </div>
  )
}
