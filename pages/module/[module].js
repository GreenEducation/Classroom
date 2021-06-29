import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './module.module.scss'

export default function Module({module}) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>

          <div className={styles.main__left}>
            <BigHero>
              <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jjqgP9dpD1k"
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
            </BigHero>
            <div className={styles.upNext}>
              <small>Up next</small>
              <ActivityCard layout="horizontal" image="/images/math.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" />
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
              <ActivityCard layout="horizontal" image="/images/math.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" /><br />
              <ActivityCard layout="horizontal" image="/images/english.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" /><br />
              <ActivityCard layout="horizontal" image="/images/physics.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" /><br />
            </div>
          </div>

          <div className={styles.main__right}>
            <Checklist title="Submissions" items={[["Assignment 2", true], ["Assignment 3", false], ["Assignment 4", true]]} />
            <Checklist title="Due this week" items={[["Assignment 2", true], ["Assignment 3", false], ["Assignment 4", true]]} />
            <Checklist title="To Do" items={[["Assignment 2", true], ["Assignment 3", false], ["Quiz 3", true]]} />
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

  // Make sure the GET string (params.module) is valid
  // Must be a hexa string of length 24
  // TODO: make sure the string is hexa
  if(params.module.length!=24) {
    return {
      notFound: true,
    }
  }

  // Connect to DB and query using the passed module_id
  // TODO: Check if the user is in this module, else 404
  const { db } = await connectToDatabase()
  const res = await db.collection("modules")
    .findOne(
      { _id: new ObjectId(params.module) },
      { projection: { name: 1, activities: 1 }}
    )

  // Handles the case where the module is not found
  if (!res) {
    return {
      notFound: true,
    }
  }

  // Processing the data so that react can work with it
  // Converting complex json to simple json
  const data = JSON.parse(JSON.stringify(res))

  return {
    props: {module: data},
    revalidate: 1 // re-render in 1 sec after every request
  }
}