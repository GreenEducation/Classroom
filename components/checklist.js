import Link from 'next/link'
import styles from './checklist.module.scss'

function CheckListItem({item, done, id}) {
  return (
    <span className={styles.item}>
        {done ? 
        <input type="checkbox" className={styles.checkbox} id={id} defaultChecked /> :
        <input type="checkbox" className={styles.checkbox} id={id} />
        }
        <label for={id}>
          <Link href={`/activity/${id}`}><a>{item}</a></Link>
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
        items.map((item) => (
          <CheckListItem item={item.details[0].name} done={item.status=="complete"}
            id={item.activity_id} />
        ))
      }
    </div>
  )
}