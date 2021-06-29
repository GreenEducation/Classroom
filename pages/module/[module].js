import Head from 'next/head'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../util/mongodb'
import Layout, { siteTitle } from '../../components/layout'
import BigHero from '../../components/big-hero'
import ActivityCard from '../../components/activity-card'
import Checklist from '../../components/checklist'
import styles from './module.module.scss'

export default function Module({mod}) {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>

          <div className={styles.main__left}>
            <h6>{mod.name}</h6>
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
                mod.activities?.map((activity) => (
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
  return {
    paths: [],
    fallback: true
  }
}

export async function getStaticProps({params}) {

  const { db } = await connectToDatabase()

  // TODO: check module id before passing into the db
  const data = await db.collection("modules")
    .findOne(
      { _id: new ObjectId(params.module) },
      { projection: { name: 1, activities: 1 }}
    )

  // Handles the case where the module is not found
  if (!data) {
    return {
      notFound: true,
    }
  }

  return {
    props: {mod: JSON.parse(JSON.stringify(data))},
    revalidate: 1
  }
}