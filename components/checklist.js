import Link from 'next/link'
import styles from './checklist.module.scss'


// Each item in a checklist
function CheckListItem({title, item, done, activity_id, studentActId}) {

  async function setStatus(studentActId) {
    let status = document.getElementById(title + studentActId).checked
    status = status ? 'complete' : 'incomplete'
    const res = await fetch('https://greened.app/api/activity-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({studentActId, status})
    })
    return res.json()
  }

  return (
    <span className={styles.item}>
        {done ? 
        <input type="checkbox" className={styles.checkbox} id={title + studentActId} checked='true'
          onClick={() => setStatus(studentActId)} /> :
        <input type="checkbox" className={styles.checkbox} id={title + studentActId} value='1'
          onClick={() => setStatus(studentActId)} />
        }
        <label htmlFor={title + studentActId}>
          <Link href={`/activity/${activity_id}`}><a>{item}</a></Link>
        </label>
      <br />
    </span>
  )
}


// The entire checklist component
export default function Checklist({ title, items=[] }) {
  return (
    <div className={styles.container}>
      <h6 className={styles.title}>{title}</h6>
      {
        items.length!==0 ?
        items.map((item) => (
          <CheckListItem title={title} item={item.details[0].name} done={item.status=="complete"}
            activity_id={item.activity_id} studentActId={item._id} key={item._id} />
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