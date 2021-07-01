import Link from 'next/link'
import Image from 'next/image'
import styles from './activity-card.module.scss'


//Require props for error handling
export default function ActivityCard({ layout, image, main, sub, url="/" }) {
  const layoutStyles = layout=="horizontal" ? styles.container__horizontal : styles.container
  return (
    <div className={layoutStyles}>
      <div className={styles.image}>
        <Link href={url}><a>
          <Image
            src={image}
            layout="fill"
            alt="algorithms on a paper"
            objectFit="cover"
          />
        </a></Link>
      </div>
      <span>
        <Link href={url}><a><h6 className={styles.mainText}>{main}</h6></a></Link>
        <small>{sub}</small>
      </span>
    </div>
  )
}