import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import BigHero from '../components/big-hero'
import Card from '../components/card'
import ActivityCard from '../components/activity-card'
import styles from './home.module.scss'

/*
if user is logged in:
  get email from auth0
  get first name from DB
  get list of active courses
  get list of activities where course_id matches any one of the active courses, sort using `order` and limit to 5, and use project to only get what you want
  
else:
  redirect to index
*/

export default function Home() {

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <BigHero>
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jjqgP9dpD1k"
            title="YouTube video player" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen></iframe>
        </BigHero>
        <div className={styles.topSection}>
          <ActivityCard image="/images/math.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" />
          <ActivityCard image="/images/english.jpg" main="Lecture 4" sub="CS 246 | Watch time: ~12 mins" />
          <ActivityCard image="/images/physics.jpg" main="Chapter 2.3" sub="Math 235 | Reading time: ~13 mins" />
          <ActivityCard image="/images/cs.jpg" main="Assignment 3" sub="CS 246 | Assignment time: ~30 mins" />
        </div>
        <Card style={{width: `100%`}}>
          <a href="/api/auth/logout">Logout</a>
          <br /><br /><br /><br /><br /><br /><br />
        </Card>
      </div>
    </Layout>
  )
}
