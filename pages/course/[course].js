import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import Card from '../../components/card'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './course.module.scss'

export default function Course({ modules, activities }) {
  return (
    <Layout modules={modules}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <BigHero type={activities[0].details[0].type} file_url={activities[0].details[0].file_url} />
        <div className={styles.main}>
          <div className={styles.main__left}>
            <div className={styles.upNext}>
              <small>Up next</small>
              <ActivityCard layout="horizontal" image={activities[1].details[0].image_url}
                main={activities[1].details[0].name} mainUrl={`/activity/${activities[1].activity_id}`}
                sub={activities[1].details[0].course_name} subUrl={`/course/${activities[1].details[0].course_id}`}
                duration={activities[1].details[0].duration} />
            </div>
            <div className={styles.announcement}>
              <Card>
                <small>Posted by Professor Jao - CS 235</small>
                <h6>Assignment 5's due date has been pushed by 3 days</h6>
                <p>Since a lot of students requested for it. We have decided to extend
                   the deadline for this week's assignment</p>
              </Card>
              <Card>
                <small>Posted by Professor Jao - CS 235</small>
                <h6>Assignment 5's due date has been pushed by 3 days</h6>
                <p>Since a lot of students requested for it. We have decided to extend
                   the deadline for this week's assignment</p>
              </Card>
              <Card>
                <small>Posted by Professor Jao - CS 235</small>
                <h6>Assignment 5's due date has been pushed by 3 days</h6>
                <p>Since a lot of students requested for it.</p>
              </Card>
            </div>
          </div>
          <div className={styles.main__right}>
            <Checklist title="Due this week" items={[["Assignment 2", true], ["Assignment 3", false], ["Assignment 4", true]]} />
            <Checklist title="To Do" items={[["Assignment 2", true], ["Assignment 3", false], ["Quiz 3", true]]} />
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

  // Make sure the GET string (params.module) is valid
  // Must be a hexa string of length 24
  // TODO: make sure the string is hexa, use regex
  if(params.course.length!=24) {
    return {
      notFound: true,
    }
  }

  // Connect to DB and query using the passed course_id
  const { db } = await connectToDatabase()

  // TODO: Check if the user is in this course, else 404
  const course_id = new ObjectId(params.course);
  const data = await db.collection("courses")
    .findOne(
      {_id: course_id},
      { projection: { modules: 1 }}
    )
  
  // Handles the case where the course is not found
  if (!data) {
    return {
      notFound: true,
    }
  }

  // Querying activities based on the user's id and course_id
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
        details: {
          name: 1,
          duration: 1,
          image_url: 1,
          file_url: 1,
          type: 1,
          course_id: 1,
          course_name: 1,
        }
      }
    },
    { $limit: 2 }
  ]).toArray()

  return {
    props: {
      modules: JSON.parse(JSON.stringify(data)).modules,
      activities: JSON.parse(JSON.stringify(activities))
    },
    revalidate: 1 // re-render in 1 sec after every request
  }
}