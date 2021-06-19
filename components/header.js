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
      <span>username</span>
    </div>
  )
}