import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import { ObjectId } from 'mongodb'
import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'
import Layout, { siteTitle } from '../components/layout'
import BigHero from '../components/big-hero'
import Card from '../components/card'
import ActivityCard from '../components/activity-card'
import styles from './home.module.scss'

/*TODO:
Add a 'show more' button for announcements
Add a calendar below or above the annoucements
Add course button
*/

export default function Home({ user_data, nowActivity, activities, announcements }) {

  return (
    <Layout header={{
        id: user_data._id,
        first_name: user_data.first_name,
        profile_pic: user_data.profile_pic
      }}
      sidebar={{
        this_course: null,
        courses: user_data.active_courses
      }}>

      <Head>
        <title>{siteTitle}</title>
      </Head>

      <div className={styles.container}>
        {
          nowActivity ?
          <BigHero type={nowActivity.details[0].file_type} file_url={nowActivity.details[0].file_url} /> :
          <h5>You do not have any activities due</h5>
        }

        <div className={styles.topSection}>
          {activities?.map((activity) => (
            <ActivityCard image={activity.details[0].image_url} main={activity.details[0].name}
              mainUrl={`/activity/${activity.activity_id}`} subUrl={`/course/${activity.details[0].course_id}`}
              sub={activity.details[0].course_name} duration={activity.details[0].duration} />
          ))}
        </div>

        {
          announcements?.map((announcement) => (
            <Card>
              <small>Posted by {announcement.creator_name} - {announcement.course_name}</small>
              <h6>{announcement.title}</h6>
              <p>{announcement.content}</p>
            </Card>
          ))
        }

        <div className={styles.addCourse}>
          <button>+</button>
          <p>Add a course</p>
        </div>
      </div>

    </Layout>
  )
}



// Renders the page on the server, CSR is better
// withPageAuthRequired ensures that the page is secured
export const getServerSideProps = withPageAuthRequired({

  // Querying data and passing them as props
  async getServerSideProps(context) {

    //Get user data from Auth0
    const user_email = getSession(context.req).user.email

    const { db } = await connectToDatabase()
    // Querying basic user data
    const user_data = await db.collection("users")
      .findOne({ email: user_email },
               { projection: {first_name: 1, profile_pic: 1, account_type: 1, active_courses: 1} })
    
    // Handling the case where the user has not finished the sign up process
    if (!user_data) {
      return {
        redirect: {
          destination: '/signup',
          permanent: false,
        },
      }
    }


    // Querying activities based on the user's id
    // TODO: Maybe change the ordering of the activities
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
            file_type: 1,
            course_id: 1,
            course_name: 1,
          }
        }
      },
      { $limit: 5 }
    ]).toArray()

    //pop the first activity off the array and pass it as the now activity
    //and pass the rest as an array of activities
    const nowActivity = activities.length >= 1 ? JSON.parse(JSON.stringify(activities.shift())) : null

    // Querying announcements based on the course_id
    const active_course_ids = user_data.active_courses.map((course) => (course.uid))
    const announcements = await db.collection("announcements")
    .find( { course_id: { $in: active_course_ids } } )
    .project({ creator_name: 1, course_name: 1, title: 1, content: 1 }).sort({ date: -1 }).toArray()


    return {
      props: {
        user_data: JSON.parse(JSON.stringify(user_data)),
        nowActivity,
        activities: JSON.parse(JSON.stringify(activities)),
        announcements: JSON.parse(JSON.stringify(announcements))
      },
    }
  }
});