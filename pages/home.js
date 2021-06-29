import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { ObjectId } from 'mongodb'
import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'
import Layout, { siteTitle } from '../components/layout'
import BigHero from '../components/big-hero'
import Card from '../components/card'
import ActivityCard from '../components/activity-card'
import styles from './home.module.scss'


/*
TODO:
https://www.youtube.com/watch?v=4sXAWsUub-s
if user is logged in:
  get email from auth0
  get first name from DB
  get list of active courses
  get list of activities where course_id matches any one of the active courses, sort using `order` and limit to 5, and use project to only get what you want
  get all announcements where course_id matches any one of the active courses, list in reverse chronological order
else:
  redirect to index

Add a 'show more' button for announcements
Add a calendar below or above the annoucements
*/

export default function Home({ user_data, activities }) {
  return (
    <Layout header={user_data.first_name} courses={user_data.active_courses}>

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
          {activities?.map((activity) => (
            <p>{activity.type}</p>
            ))}
          <a href="/api/auth/logout">Logout</a>
          <br /><br /><br /><br /><br /><br /><br />
        </Card>
      </div>

    </Layout>
  )
}


// Renders the page on the server, CSR is better
// withPageAuthRequired ensures that the page is secured
export const getServerSideProps = withPageAuthRequired({

  // Querying data and passing them as props
  async getServerSideProps(context) {

    const { db } = await connectToDatabase()
    const user_data = await db.collection("users")
      .findOne({ email: 'rayyanmaster@gmail.com' },
               { projection: {first_name: 1, account_type: 1, active_courses: 1} })
    
    //new ObjectId("60d4c162ad30c9542761fecc")
    const activities = await db.collection("student_activities").aggregate([
      { $match: { student_id: new ObjectId(user_data._id) } },
      { $sort: {order: 1} },
      { $project: {activity_id: 1, type: 1} },
      { $limit: 5 }
    ]).toArray()

    // NextJS is unable to parse complex objects (i.e. objs inside objs)
    // Converting complex objects to simple ones, so that nextjs can understand
    //const properties = JSON.parse(JSON.stringify(data));

    return {
      props: {
        user_data: JSON.parse(JSON.stringify(user_data)),
        activities: JSON.parse(JSON.stringify(activities))
      },
    }
  }
});