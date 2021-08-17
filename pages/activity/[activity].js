import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { useEffect, useState } from "react"
import Pusher from "pusher-js"
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import Comments from '../../components/comments'
import styles from './activity.module.scss'


export default function Activity({ user_data, course_profile, activity, nextActivity, comments, due_soon, todo, submissions }) {


  // https://github.com/onedebos/pusher-chat-app/blob/main/pages/chat.js
  // Connecting to Pusher
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: "us2",
    encrypted: true
  })

  // Init checklist states
  const [todoList, setTodo] = useState(todo)
  const [dueSoonList, setDueSoon] = useState(due_soon)
  const [submissionsList, setSubmissions] = useState(submissions)
  const [activityUpdate, setActivityUpdate] = useState(false)

  // Runs when Component is mounted
  useEffect(() => {
    // Subscribe to a Pusher Channel
    const channel = pusher.subscribe('activities')

    // TODO:
    // - Should be user specific
    // When any activity is updated
    channel.bind("activity-status", (data) => {

      // TODO: change an item in an array will not cause rerender,
      // since react compares the ref.s of the array
      // Slicing every array to create a change in the state
      setTodo((prevState) => {
        prevState.find((obj, index) => {
          if (obj._id === data.studentActId) {
            prevState[index] = {
              _id: obj._id,
              activity_id: obj.activity_id,
              percent_completed: obj.percent_completed,
              status: data.status,
              details: [{ name: obj.details[0].name }]
            }
            prevState.slice()
            return true // stop searching
          }
        })
        return prevState
      })

      setSubmissions((prevState) => {
        prevState.find((obj, index) => {
          if (obj._id === data.studentActId) {
            prevState[index] = {
              _id: obj._id,
              activity_id: obj.activity_id,
              percent_completed: obj.percent_completed,
              status: data.status,
              details: [{ name: obj.details[0].name }]
            }
            prevState.slice()
            return true // stop searching
          }
        })
        return prevState
      })

      setDueSoon((prevState) => {
        prevState.find((obj, index) => {
          if (obj._id === data.studentActId) {
            prevState[index] = {
              _id: obj._id,
              activity_id: obj.activity_id,
              percent_completed: obj.percent_completed,
              status: data.status,
              details: [{ name: obj.details[0].name }]
            }
            prevState.slice()
            return true // stop searching
          }
        })
        return prevState
      })

      // Showing a pop for a few seconds notifying the user of the change
      setActivityUpdate(true)
      setTimeout(() => setActivityUpdate(false), 3500);
      
    })

    // Closing Pusher Channel
    return () => {
      pusher.unsubscribe("activities");
    }
  }, [])


  // Send Help Request data to an API endpoint
  async function helpRequest(){
    await fetch(`https://greened.app/api/help-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          course_id: course_profile.course_id,
          module_id: activity[0].details[0].module_id,
          activity_id: activity[0].activity_id,
          student_id: user_data._id,
          message: 'test',
          resolved: false
        }
      ),
    })
    .then( res => console.log(res) )
    .catch( err => console.error(err) )
  }


  return (
    <Layout header={{
        id: user_data._id,
        first_name: user_data.first_name,
        profile_pic: user_data.profile_pic
      }}
      sidebar={{
        this_course: course_profile.course_id,
        courses: user_data.active_courses,
        modules: course_profile.modules
      }}
    >
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.main__left}>
            <progress id="activity_progress" value={activity[0].percent_completed} max="100" style={{width: `100%`}}>
              {activity[0].percent_completed}%
            </progress>
            <BigHero type={activity[0].details[0].file_type} file_url={activity[0].details[0].file_url} />
            <div className={styles.details}>
              <span>Details about the activity.<br/>CS230 course</span>
              <div className={styles.getHelp}>
                <a onClick={(e) => {e.preventDefault; toggleHelp()}}>Get help</a>
                <span id="help-form">
                  <textarea></textarea>
                  <button className={styles.button} onClick={(event) => {event.preventDefault; helpRequest()}}>Get Help</button>
                </span>
              </div>
            </div>
            {
              (nextActivity.length!=0) ?
              <div className={styles.upNext}>
                <small>Up next</small>
                <ActivityCard layout="horizontal" image={nextActivity[0].details[0].image_url}
                  main={nextActivity[0].details[0].name} mainUrl={`/activity/${nextActivity[0].activity_id}`}
                  sub={nextActivity[0].details[0].course_name} subUrl={`/course/${nextActivity[0].details[0].course_id}`}
                  duration={nextActivity[0].details[0].duration} />
              </div>
              : ''
            }
            <br />
            {
              comments ?
                <Comments user={{'image': 'https://greened-users.nyc3.digitaloceanspaces.com/user.png'}}
                  comments={comments} />
                : ''
            }
            { activityUpdate ? <div className={styles.popup}>Activity updated</div> : '' }
          </div>
          <div className={styles.main__right}>
            <Checklist title="Submissions" items={submissionsList} />
            <Checklist title="Due this week" items={dueSoonList} />
            <Checklist title="To Do" items={todoList} />
          </div>
        </div>
      </div>
    </Layout>
  )
}


//getServerSideProps Fetches data on each request
//withPageAuthRequired protects this page
export const getServerSideProps = withPageAuthRequired({

  // Querying data and passing them as props
  async getServerSideProps(context) {

    // GET request must be a hexa string of length 24
    const reg = /[0-9A-Fa-f]{24}/g
    if(!reg.test(context.params.activity)) return { notFound: true }

    //Get user data from Auth0
    const user_email = getSession(context.req).user.email

    // Connect to DB and query using the passed activity_id
    const { db } = await connectToDatabase()
    const activity_id = new ObjectId(context.params.activity)

    // Querying basic user data
    const user_data = await db.collection("users")
    .findOne({ email: user_email },
            { projection: {first_name: 1, profile_pic: 1, active_courses: 1} })


    //TODO: query hasComments and comments_id
    // Query detail about the selected activity
    const activity = await db.collection("student_activities").aggregate([
      { $match: { student_id: user_data._id, activity_id: activity_id } },
      { 
        $lookup: {
        from: "activities",
        localField: "activity_id",
        foreignField: "_id",
        as: "details"
        }
      },
      {
        $project: {
          activity_id: 1,
          percent_completed: 1,
          status: 1,
          order: 1,
          details: {
            name: 1,
            activity_type: 1,
            duration: 1,
            image_url: 1,
            file_url: 1,
            file_type: 1,
            course_id: 1,
            module_id: 1,
            comments_id: 1,
          }
        }
      }
    ]).toArray()
    // Handles the case where the activity is not found or user is not assigned the activity
    if (!activity) return { notFound: true }


    // Query details about the next activity
    const nextActivity = await db.collection("student_activities").aggregate([
      { 
        $match: {
          student_id: user_data._id,
          course_id: activity[0].details[0].course_id,
          status: "incomplete",
          order: { $gt: activity[0].order }
        }
      },
      { 
        $lookup: {
        from: "activities",
        localField: "activity_id",
        foreignField: "_id",
        as: "details"
        }
      },
      {
        $project: {
          activity_id: 1,
          percent_completed: 1,
          status: 1,
          order: 1,
          details: {
            name: 1,
            activity_type: 1,
            duration: 1,
            image_url: 1,
            course_id: 1,
            course_name: 1,
          }
        }
      },
      { $limit: 1 }
    ]).toArray()

    
    // Get all the modules in this course
    const course_profile = await db.collection("course_profiles").findOne(
      { 
        student_id: user_data._id,
        course_id: new ObjectId(activity[0].details[0].course_id)
      },
      { projection: { course_id: 1, modules: 1 }}
    )


    // Calculate the first and last day of this week
    // TODO: make it between the last 3 and next 3 days??
    let today = new Date
    let first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
    let last = first + 6; // last day is the first day + 6
    let firstday = new Date(today.setDate(first));
    let lastday = new Date(today.setDate(last));
    
    // Get the activities due this week
    const due_soon = await db.collection("student_activities").aggregate([
      { $match: {
        student_id: user_data._id,
        course_id: new ObjectId(activity[0].details[0].course_id),
        due_dates: { $gte: firstday, $lte: lastday }
      }},
      { $sort: {due_dates: 1} },
      { 
        $lookup: {
        from: "activities",
        localField: "activity_id",
        foreignField: "_id",
        as: "details"
        }
      },
      {
        $project: {
          activity_id: 1,
          percent_completed: 1,
          status: 1,
          details: { name: 1 }
        }
      },
      { $limit: 5 }
    ]).toArray()


    // Querying activities from the oldest incomplete module,
    // sort incomplete activities first and then complete
    const latest_module = course_profile.modules.find((module) => (
      module.percent_completed!=100
    ))
    const todo = await db.collection("student_activities").aggregate([
      { $match: {
        student_id: user_data._id,
        module_id: new ObjectId(latest_module.uid)
      }},
      { $sort: {status: -1, order: 1} },
      { 
        $lookup: {
        from: "activities",
        localField: "activity_id",
        foreignField: "_id",
        as: "details"
        }
      },
      {
        $project: {
          activity_id: 1,
          percent_completed: 1,
          status: 1,
          details: { name: 1 }
        }
      },
      { $limit: 5 }
    ]).toArray()


    // Get all the submission for this module
    const submissions = await db.collection("student_activities").aggregate([
      { $match: {
        student_id: user_data._id,
        module_id: activity[0].details[0].module_id,
        type: { $in: ['quiz','assignment','exam'] }
      }},
      { $sort: { order: 1} },
      { 
        $lookup: {
        from: "activities",
        localField: "activity_id",
        foreignField: "_id",
        as: "details"
        }
      },
      {
        $project: {
          activity_id: 1,
          percent_completed: 1,
          status: 1,
          details: { name: 1 }
        }
      }
    ]).toArray()


    // Get the comments pointer for this activity
    const comments_head = await db.collection("comments").findOne(
      { _id: new ObjectId(activity[0].details[0].comments_id) },
      { projection: { comments_array: 1 }}
    )
    // TODO: do an aggregation query and get user image and other details
    // Get the comments for the selected comments pointer
    const comments = comments_head ?
      await db.collection("posts").find(
        { _id: { $in: comments_head.comments_array } }
      ).project({tags: 0}).toArray()
      : null


    return {
      props: {
        user_data:      JSON.parse(JSON.stringify(user_data)),
        course_profile: JSON.parse(JSON.stringify(course_profile)),
        activity:       JSON.parse(JSON.stringify(activity)),
        nextActivity:   JSON.parse(JSON.stringify(nextActivity)),
        comments:       comments ? JSON.parse(JSON.stringify(comments)) : null,
        due_soon:       JSON.parse(JSON.stringify(due_soon)),
        todo:           JSON.parse(JSON.stringify(todo)),
        submissions:    JSON.parse(JSON.stringify(submissions))
      }
    }
  }
})