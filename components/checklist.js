import Link from 'next/link'
import styles from './checklist.module.scss'

function CheckListItem({item, done}) {
  return (
    <span className={styles.item}>
        {done ? 
        <input type="checkbox" className={styles.checkbox} id={item} checked /> :
        <input type="checkbox" className={styles.checkbox} id={item} />
        }
        <label for={item}>
          <Link href="#"><a>{item}</a></Link>
        </label>
      <br />
    </span>
  )
}

export default function Checklist({ title, items }) {
  return (
    <div className={styles.container}>
      <h6 className={styles.title}>{title}</h6>
      {
        items.map(([key, value]) => (
          <CheckListItem item={key} done={value} />
        ))
      }
    </div>
  )
}