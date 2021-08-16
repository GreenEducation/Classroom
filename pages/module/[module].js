import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ObjectId } from 'mongodb'
import { useEffect, useState } from "react"
import Pusher from "pusher-js"
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './module.module.scss'


export default function Module({user_data, course_profile, due_soon, todo, activities}) {

  // GET the module_id
  const router = useRouter()
  const { module:module_id } = router.query

  // Get the percent_completed of this module
  const module_progress = course_profile.modules.find((module) => (module.uid==module_id)).percent_completed

  // Get incomplete activities to display on 'next' and 'now'
  let nextActivities = activities.filter((activity) => (activity.status=="incomplete"))
  nextActivities.length = 2

  // Get the submissions from activities
  let submissions = activities.filter((activity) => (
    activity.details[0].activity_type=="quiz" ||
    activity.details[0].activity_type=="assignment" ||
    activity.details[0].activity_type=="exam"
  ))


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


  return (
    <Layout
      header={{
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
            <progress id="course_progress" value={module_progress} max="100" style={{width: `100%`}}>
              {module_progress}%
            </progress>
            {
              nextActivities[0] ?
              <BigHero type={nextActivities[0].details[0].file_type} file_url={nextActivities[0].details[0].file_url} />
              : 'There are no activities in this module'
            }
            {
              nextActivities[1] ?
              <div className={styles.upNext}>
                <small>Up next</small>
                <ActivityCard layout="horizontal" image={nextActivities[1].details[0].image_url}
                  main={nextActivities[1].details[0].name} mainUrl={`/activity/${nextActivities[1].activity_id}`}
                  sub={nextActivities[1].details[0].course_name} subUrl={`/course/${nextActivities[1].details[0].course_id}`}
                  duration={nextActivities[1].details[0].duration} />
              </div>
              : ''
            }<br />
            <div className={styles.content}>
              <small>Content for {course_profile.modules[0].name}</small>
              {
                // The page is rendered first, and is later re-rendered with the db data
                // So we need to have 'module?'. To make sure the function is only run when module is loaded
                activities?.map((activity) => (
                  <><ActivityCard layout="horizontal" image={activity.details[0].image_url}
                      main={activity.details[0].name} mainUrl={`/activity/${activity.activity_id}`}
                      sub={activity.details[0].course_name} subUrl={`/course/${activity.details[0].course_id}`}
                      duration={activity.details[0].duration} /><br /></>
                ))
              }
            </div>
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
    if(!reg.test(context.params.module)) return { notFound: true }

    //Get user data from Auth0
    const user_email = getSession(context.req).user.email

    // Connect to DB and query using the passed module_id
    const { db } = await connectToDatabase()
    const module_id = new ObjectId(context.params.module)
    
    // Querying basic user data
    const user_data = await db.collection("users")
    .findOne({ email: user_email },
            { projection: {first_name: 1, profile_pic: 1, active_courses: 1} })


    // Querying all activities based on the user's id and course_id
    const activities = await db.collection("student_activities").aggregate([
      { $match: { student_id: user_data._id, module_id: module_id } },
      { $sort: {order: 1} },
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
          details: {
            name: 1,
            activity_type: 1,
            duration: 1,
            image_url: 1,
            file_url: 1,
            file_type: 1,
            course_id: 1,
            course_name: 1,
          }
        }
      }
    ]).toArray()
    // Handles the case where the module is not found or user is not enrolled in the course
    if (!activities) return { notFound: true }
    // Handles the case where there are no activities in the module
    //if (activities.length===0) return { notFound: true }


    // Get all the modules in this course
    const module = await db.collection("modules")
      .findOne(
        { _id: module_id },
        { projection: { course_id: 1 }}
      )
    const course_id = new ObjectId(module.course_id)
    const course_profile = await db.collection("course_profiles")
      .findOne(
        { student_id: user_data._id, course_id: course_id },
        { projection: { course_id: 1, modules: 1 }}
      )
    // TODO: use aggregate retrieve course_id with needing 


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
        course_id,
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
          course_id: 1,
          module_id: 1,
          percent_completed: 1,
          status: 1,
          details: { name: 1 }
        }
      },
      { $limit: 5 }
    ]).toArray()


    return {
      props: {
        user_data:      JSON.parse(JSON.stringify(user_data)),
        course_profile: JSON.parse(JSON.stringify(course_profile)),
        due_soon:       JSON.parse(JSON.stringify(due_soon)),
        todo:           JSON.parse(JSON.stringify(todo)),
        activities:     JSON.parse(JSON.stringify(activities))
      }
    }
  }
})