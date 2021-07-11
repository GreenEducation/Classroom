import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import Card from '../../components/card'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './course.module.scss'


export default function Course({ modules, activities, todo, due_soon, announcements }) {
  return (
    <Layout modules={modules}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <BigHero type={activities[0].details[0].file_type} file_url={activities[0].details[0].file_url} />
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
                  <Card>
                    <small>Posted by {announcement.creator_name} - {announcement.course_name}</small>
                    <h6>{announcement.title}</h6>
                    <p>{announcement.content}</p>
                  </Card>
                ))
              }
            </div>
          </div>
          <div className={styles.main__right}>
            <Checklist title="Due this week" items={due_soon} />
            <Checklist title="To Do" items={todo} />
          </div>
        </div>
      </div>
    </Layout>
  )
}


export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export async function getStaticProps({params}) {

  // GET request must be a hexa string of length 24
  const reg = /[0-9A-Fa-f]{24}/g
  if(!reg.test(params.course)) return { notFound: true }

  // Connect to DB and query using the passed course_id
  const { db } = await connectToDatabase()
  const course_id = new ObjectId(params.course)


  // Check if the user is enrolled in this course & get modules in the course
  const course_profile = await db.collection("course_profiles")
    .findOne(
      { student_id: new ObjectId("60d4c162ad30c9542761fecc"), course_id: course_id },
      { projection: { modules: 1 }}
    )
  // Handles the case where the user is not enrolled in this course
  // or the course is not found
  if (!course_profile) return { notFound: true }


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
    { $match: { student_id: new ObjectId("60d4c162ad30c9542761fecc"), course_id: course_id, status: "incomplete" } },
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


  // Querying announcements based on the course_id
  const announcements = await db.collection("announcements")
    .find({course_id: course_id})
    .project({ creator_name: 1, course_name: 1, title: 1, content: 1 }).sort({ date: -1 }).toArray()


  return {
    props: {
      modules: JSON.parse(JSON.stringify(course_profile)).modules,
      activities: JSON.parse(JSON.stringify(activities)),
      due_soon: JSON.parse(JSON.stringify(due_soon)),
      todo: JSON.parse(JSON.stringify(todo)),
      announcements: JSON.parse(JSON.stringify(announcements))
    },
    revalidate: 1 // re-render in 1 sec after every request
  }
}