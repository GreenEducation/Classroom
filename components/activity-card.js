import Link from 'next/link'
import Image from 'next/image'
import styles from './activity-card.module.scss'


//Require props for error handling
export default function ActivityCard({ layout, image, main, sub, mainUrl="/", subUrl="/", duration }) {
  const layoutStyles = layout=="horizontal" ? styles.container__horizontal : styles.container
  return (
    <div className={layoutStyles}>
      <div className={styles.image}>
        <Link href={mainUrl}><a>
          <Image
            src={image}
            layout="fill"
            alt="algorithms on a paper"
            objectFit="cover"
          />
        </a></Link>
      </div>
      <span>
        <Link href={mainUrl}><a><h6 className={styles.mainText}>{main}</h6></a></Link>
        <Link href={subUrl}><a><small>{sub}</small></a></Link>
        <small> | Time: {duration} mins</small>
      </span>
    </div>
  )
}