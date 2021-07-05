import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './module.module.scss'

export default function Module({module, activities}) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>

          <div className={styles.main__left}>
            <BigHero type={activities[0].details[0].file_type} file_url={activities[0].details[0].file_url} />
            <div className={styles.upNext}>
              <small>Up next</small>
              <ActivityCard layout="horizontal" image={activities[1].details[0].image_url}
                main={activities[1].details[0].name} mainUrl={`/activity/${activities[1].activity_id}`}
                sub={activities[1].details[0].course_name} subUrl={`/course/${activities[1].details[0].course_id}`}
                duration={activities[1].details[0].duration} />
            </div><br />
            <div className={styles.content}>
              <small>Content for week 1</small>
              {
                // The page is rendered first, and is later re-rendered with the db data
                // So we need to have 'module?'. To make sure the function is only run when module is loaded
                module?.activities.map((activity) => (
                  <><ActivityCard layout="horizontal" image="/images/math.jpg"
                      main={activity.name} sub="Math 138 | Reading time: ~17 mins" /><br /></>
                ))
              }
            </div>
          </div>

          <div className={styles.main__right}>
            <Checklist title="Submissions" items={activities} />
            <Checklist title="Due this week" items={activities} />
            <Checklist title="To Do" items={activities} />
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
  // TODO: Check if the user is in this module, else 404
  const { db } = await connectToDatabase()
  const module_id = new ObjectId(params.module)
  
  const res = await db.collection("modules")
    .findOne(
      { _id: module_id },
      { projection: { name: 1, activities: 1 }}
    )

  // Handles the case where the module is not found
  if (!res) return { notFound: true }

  //TODO: temp todos
  const activities = await db.collection("student_activities").aggregate([
    { $match: { student_id: new ObjectId("60d4c162ad30c9542761fecc"), module_id: module_id } },
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
    { $limit: 5 }
  ]).toArray()

  // Processing the data so that react can work with it
  // Converting complex json to simple json
  const data = JSON.parse(JSON.stringify(res))

  return {
    props: {
      module: data,
      activities: JSON.parse(JSON.stringify(activities))
    },
    revalidate: 1 // re-render in 1 sec after every request
  }
}