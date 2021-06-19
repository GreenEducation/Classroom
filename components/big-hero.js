import styles from './big-hero.module.scss'

export default function BigHero({ children }) {
  return (
    <div className={styles.container}>
      { children }
    </div>
  )
}