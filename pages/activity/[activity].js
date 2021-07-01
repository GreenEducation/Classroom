import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import Comments from '../../components/comments'
import styles from './activity.module.scss'

export default function Activity({ activity }) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.main__left}>
            { activity.name }
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
            <Comments user={{'image': '/images/math.jpg'}} comments={[{'image': '/images/math.jpg', 'name': 'Rayyan', 'content': 'I could not understand how we got the final answer from 7.5. Can someone explain that to me please?'},
              {'name': 'Ahmed', 'content': 'I could not understand how we got the final answer from 7.5. Can someone explain that to me please?'}]} />
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

  // Make sure the GET string (params.activity) is valid
  // Must be a hexa string of length 24
  // TODO: make sure the string is hexa
  if(params.activity.length!=24) {
    return {
      notFound: true,
    }
  }

  // Connect to DB and query using the passed activity_id
  // TODO: Check if the user is in this activity, else 404
  const { db } = await connectToDatabase()
  const res = await db.collection("activities")
    .findOne(
      { _id: new ObjectId(params.activity) },
      { projection: { name: 1 }}
    )

  // Handles the case where the activity is not found
  if (!res) {
    return {
      notFound: true,
    }
  }

  // Processing the data so that react can work with it
  // Converting complex json to simple json
  const data = JSON.parse(JSON.stringify(res))

  return {
    props: {activity: data},
    revalidate: 1 // re-render in 1 sec after every request
  }
}