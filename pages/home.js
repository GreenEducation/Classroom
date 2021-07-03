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

export default function Home({ user_data, nowActivity, activities }) {

  return (
    <Layout header={user_data.first_name} courses={user_data.active_courses}>

      <Head>
        <title>{siteTitle}</title>
      </Head>

      <div className={styles.container}>
        <BigHero type={nowActivity?.details[0].type} file_url={nowActivity.details[0].file_url} />
        <div className={styles.topSection}>
          {activities?.map((activity) => (
            <ActivityCard image={activity.details[0].image_url} main={activity.details[0].name}
              mainUrl={`/activity/${activity.activity_id}`} subUrl={`/course/${activity.details[0].course_id}`}
              sub={activity.details[0].course_name} duration={activity.details[0].duration} />
          ))}
        </div>
        <Card style={{width: `100%`}}>
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
    
    // Querying basic user data
    const user_data = await db.collection("users")
      .findOne({ email: 'rayyanmaster@gmail.com' },
               { projection: {first_name: 1, account_type: 1, active_courses: 1} })
    
    // Querying activities based on the user's id
    const activities = await db.collection("student_activities").aggregate([
      { $match: { student_id: new ObjectId(user_data._id), status: "incomplete" } },
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
      { $limit: 5 }
    ]).toArray()

    //pop the first activity off the array and pass it as the now activity
    //and pass the rest as an array of activities
    const nowActivity = JSON.parse(JSON.stringify(activities.shift()))


    return {
      props: {
        user_data: JSON.parse(JSON.stringify(user_data)),
        nowActivity,
        activities: JSON.parse(JSON.stringify(activities))
      },
    }
  }
});