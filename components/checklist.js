import Link from 'next/link'
import styles from './checklist.module.scss'

function CheckListItem({title, item, done, id, studentActId}) {

  async function setStatus(id, status) {
    const res = await fetch('http://localhost:3000/api/activity-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({id: id, status: status})
    })
    return res.json()
  }

  return (
    <span className={styles.item}>
        {done ? 
        <input type="checkbox" className={styles.checkbox} id={title + id} defaultChecked
          onClick={() => setStatus(studentActId,'incomplete')} /> :
        <input type="checkbox" className={styles.checkbox} id={title + id}
          onClick={() => setStatus(studentActId, 'complete')} />
        }
        <label for={title + id}>
          <Link href={`/activity/${id}`}><a>{item}</a></Link>
        </label>
      <br />
    </span>
  )
}

export default function Checklist({ title, items=[] }) {
  return (
    <div className={styles.container}>
      <h6 className={styles.title}>{title}</h6>
      {
        items.length!==0 ?
        items.map((item) => (
          <CheckListItem title={title} item={item.details[0].name} done={item.status=="complete"}
            id={item.activity_id} studentActId={item._id} />
        ))
        : 'You do not have any items in this check list'
      }
    </div>
  )
}


//TODO:
/*
get the current user's data, pass it from the page
item._id return the student_activity's id
onclick change the status of the clicked activity
send a post request with the activity_id and the new status
---
try to make all the instances of an activity on a page synchronized

might have to change get queries to subscriptions - for checklist items, progress bar, up next
*/