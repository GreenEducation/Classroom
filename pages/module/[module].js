import Head from 'next/head'
import { useRouter } from 'next/router'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './module.module.scss'


export default function Module({modules, due_soon, todo, activities}) {

  // GET the module_id
  const router = useRouter()
  const { module:module_id } = router.query

  // Get the percent_completed of this module
  const module_progress = modules.find((module) => (module.uid==module_id)).percent_completed

  // Get incomplete activities to display on 'next' and 'now'
  let nextActivities = activities.filter((activity) => (activity.status=="incomplete"))
  nextActivities.length = 2

  // Get the submissions from activities
  let submissions = activities.filter((activity) => (
    activity.details[0].activity_type=="quiz" ||
    activity.details[0].activity_type=="assignment" ||
    activity.details[0].activity_type=="exam"
  ))

  return (
    <Layout modules={modules}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>

          <div className={styles.main__left}>
            <progress id="course_progress" value={module_progress} max="100" style={{width: `100%`}}>
              {module_progress}%
            </progress>
            <BigHero type={nextActivities[0].details[0].file_type} file_url={nextActivities[0].details[0].file_url} />
            <div className={styles.upNext}>
              <small>Up next</small>
              <ActivityCard layout="horizontal" image={nextActivities[1].details[0].image_url}
                main={nextActivities[1].details[0].name} mainUrl={`/activity/${nextActivities[1].activity_id}`}
                sub={nextActivities[1].details[0].course_name} subUrl={`/course/${nextActivities[1].details[0].course_id}`}
                duration={nextActivities[1].details[0].duration} />
            </div><br />
            <div className={styles.content}>
              <small>Content for week 1</small>
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
          </div>

          <div className={styles.main__right}>
            <Checklist title="Submissions" items={submissions} />
            <Checklist title="Due this week" items={due_soon} />
            <Checklist title="To Do" items={todo} />
          </div>
          
        </div>
      </div>
    </Layout>
  )
}


export async function getStaticPaths() {

  //{ fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  //{ fallback: true } will server-render blank pages
  // for every request and fill them with data on-demand
  return {
    paths: [],
    fallback: 'blocking'
  }
}

// Runs both on the server and client
export async function getStaticProps({params}) {

  // GET request must be a hexa string of length 24
  const reg = /[0-9A-Fa-f]{24}/g
  if(!reg.test(params.module)) return { notFound: true }

  // Connect to DB and query using the passed module_id
  const { db } = await connectToDatabase()
  const module_id = new ObjectId(params.module)
  

  // Querying all activities based on the user's id and course_id
  const activities = await db.collection("student_activities").aggregate([
    { $match: { student_id: new ObjectId("60d4c162ad30c9542761fecc"), module_id: module_id, status: "incomplete" } },
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


  // Get all the modules in this course
  const course_id = new ObjectId(activities[0].details[0].course_id)
  const course_profile = await db.collection("course_profiles")
    .findOne(
      { student_id: new ObjectId("60d4c162ad30c9542761fecc"), course_id: course_id },
      { projection: { modules: 1 }}
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
      student_id: new ObjectId("60d4c162ad30c9542761fecc"),
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
      student_id: new ObjectId("60d4c162ad30c9542761fecc"),
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


  return {
    props: {
      modules:        JSON.parse(JSON.stringify(course_profile)).modules,
      due_soon:       JSON.parse(JSON.stringify(due_soon)),
      todo:           JSON.parse(JSON.stringify(todo)),
      activities:     JSON.parse(JSON.stringify(activities))
    },
    revalidate: 1 // re-render in 1 sec after every request
  }
}