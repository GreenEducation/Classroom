import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import Card from '../../components/card'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './course.module.scss'

export default function Course({ modules }) {
  return (
    <Layout modules={modules}>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <BigHero>
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jjqgP9dpD1k"
              title="YouTube video player" frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen></iframe>
        </BigHero>
        <div className={styles.main}>
          <div className={styles.main__left}>
            <div className={styles.upNext}>
              <small>Up next</small>
              <ActivityCard layout="horizontal" image="/images/math.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" />
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
    fallback: true
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
  const data = await db.collection("courses")
    .findOne(
      {_id: new ObjectId(params.course)},
      { projection: { modules: 1 }}
    )
  
  // Handles the case where the course is not found
  if (!data) {
    return {
      notFound: true,
    }
  }

  return {
    props: {modules: JSON.parse(JSON.stringify(data)).modules},
    revalidate: 1 // re-render in 1 sec after every request
  }
}