import Link from 'next/link'
import styles from './checklist.module.scss'

function CheckListItem({title, item, done, activity_id, module_id, course_id, student_id, studentActId}) {

  async function setStatus(studentActId, module_id, course_id, student_id, status) {
    const res = await fetch('http://localhost:3000/api/activity-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({studentActId, module_id, course_id, student_id, status})
    })
    return res.json()
  }

  return (
    <span className={styles.item}>
        {done ? 
        <input type="checkbox" className={styles.checkbox} id={title + studentActId} defaultChecked
          onClick={() => setStatus(studentActId, module_id, course_id, student_id, 'incomplete')} /> :
        <input type="checkbox" className={styles.checkbox} id={title + studentActId}
          onClick={() => setStatus(studentActId, module_id, course_id, student_id, 'complete')} />
        }
        <label for={title + studentActId}>
          <Link href={`/activity/${activity_id}`}><a>{item}</a></Link>
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
            activity_id={item.activity_id} module_id={item.module_id} course_id={item.course_id}
            student_id={item.student_id} studentActId={item._id} />
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