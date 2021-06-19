import Image from 'next/image'
import styles from './activity-card.module.scss'

export default function ActivityCard({ layout, image, main, sub }) {
  const layoutStyles = layout=="horizontal" ? styles.container__horizontal : styles.container
  return (
    <div className={layoutStyles}>
      <div className={styles.image}>
        <Image
          src={image}
          layout="fill"
          alt="algorithms on a paper"
          objectFit="cover"
        />
      </div>
      <span>
        <h6 className={styles.mainText}>{main}</h6>
        <small>{sub}</small>
      </span>
    </div>
  )
}