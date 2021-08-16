import Head from 'next/head'
import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import { ObjectId } from 'mongodb'
import { useEffect, useState } from "react"
import Pusher from "pusher-js"
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import Card from '../../components/card'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './course.module.scss'


export default function Course({ user_data, course_profile, activities, todo, due_soon, announcements }) {

  // Connecting to Pusher
  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
    cluster: "us2",
    encrypted: true
  })

  // Init checklist states
  const [todoList, setTodo] = useState(todo)
  const [dueSoonList, setDueSoon] = useState(due_soon)
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
    <Layout header={{
        id: user_data._id,
        first_name: user_data.first_name,
        profile_pic: user_data.profile_pic
      }}
      sidebar={{
        this_course: course_profile.course_id,
        courses: user_data.active_courses,
        modules: course_profile.modules
      }}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        {
          activities[0] ?
          <BigHero type={activities[0].details[0].file_type} file_url={activities[0].details[0].file_url} />:
          <h5>You do not have any activities due</h5>
        }
        <div className={styles.main}>
          <div className={styles.main__left}>
            {
              activities[1] ?
              <div className={styles.upNext}>
                <small>Up next</small>
                <ActivityCard layout="horizontal" image={activities[1].details[0].image_url}
                  main={activities[1].details[0].name} mainUrl={`/activity/${activities[1].activity_id}`}
                  sub={activities[1].details[0].course_name} subUrl={`/course/${activities[1].details[0].course_id}`}
                  duration={activities[1].details[0].duration} />
              </div>
              : ''
            }
            <div className={styles.announcement}>
              {
                announcements?.map((announcement) => (
                  <Card> key={announcement._id}
                    <small>Posted by {announcement.creator_name} - {announcement.course_name}</small>
                    <h6>{announcement.title}</h6>
                    <p>{announcement.content}</p>
                  </Card>
                ))
              }
            </div>
            { activityUpdate ? <div className={styles.popup}>Activity updated</div> : '' }
          </div>
          <div className={styles.main__right}>
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
    if(!reg.test(context.params.course)) return { notFound: true }

    //Get user data from Auth0
    const user_email = getSession(context.req).user.email

    // Connect to DB and query using the passed course_id
    const { db } = await connectToDatabase()
    const course_id = new ObjectId(context.params.course)


    // Querying basic user data
    const user_data = await db.collection("users")
    .findOne({ email: user_email },
            { projection: {first_name: 1, profile_pic: 1, active_courses: 1} })

    
    // Querying announcements based on the course_id
    const announcements = await db.collection("announcements")
      .find({course_id: course_id})
      .project({ creator_name: 1, course_name: 1, title: 1, content: 1 }).sort({ date: -1 }).toArray()


    // Calculate the first and last day of this week
    // These dates are used to query todos
    // TODO: make it between the last 3 and next 3 days??
    let today = new Date
    let first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
    let last = first + 6; // last day is the first day + 6
    let firstday = new Date(today.setDate(first));
    let lastday = new Date(today.setDate(last));


    //Keep track of changes to activities
    let changeStream = db.collection("student_activities").watch()
    changeStream.on("change", next => {
      // process any change event
      return getCourseData()
    }, { fullDocument: "updateLookup" })


    async function getCourseData() {
      // Check if the user is enrolled in this course & get modules in the course
      const course_profile = await db.collection("course_profiles")
        .findOne(
          { student_id: user_data._id, course_id: course_id },
          { projection: { course_id: 1, modules: 1 }}
        )
      // Handles the case where the user is not enrolled in this course
      // or the course is not found
      if (!course_profile) return { notFound: true }

      
      // Get the activities due this week
      const due_soon = await db.collection("student_activities").aggregate([
        { $match: {
          student_id: user_data._id,
          course_id: course_id,
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


      // Querying now and next activities based on the user's id and course_id
      // TODO: handle the case where there are no such activities
      const activities = await db.collection("student_activities").aggregate([
        { $match: { student_id: user_data._id, course_id: course_id, status: "incomplete" } },
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
              duration: 1,
              image_url: 1,
              file_url: 1,
              file_type: 1,
              course_id: 1,
              course_name: 1,
            }
          }
        },
        { $limit: 2 }
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
            student_id: 1,
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

      console.log(activities)
      return {
        props: {
          user_data:      JSON.parse(JSON.stringify(user_data)),
          course_profile: JSON.parse(JSON.stringify(course_profile)),
          activities:     JSON.parse(JSON.stringify(activities)),
          due_soon:       JSON.parse(JSON.stringify(due_soon)),
          todo:           JSON.parse(JSON.stringify(todo)),
          announcements:  JSON.parse(JSON.stringify(announcements))
        }
      }
    }
    // Running DB queries for the first time
    return getCourseData()
  }
});