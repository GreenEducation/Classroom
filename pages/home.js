import { withPageAuthRequired } from '@auth0/nextjs-auth0'
import { ObjectId } from 'mongodb'
//import AWS from 'aws-sdk'
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
        {nowActivity?.details[0].name}
        <BigHero>
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jjqgP9dpD1k"
            title="YouTube video player" frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen></iframe>
        </BigHero>
        <div className={styles.topSection}>
          {activities?.map((activity) => (
            <ActivityCard image={activity.details[0].image_url} main={activity.details[0].name}
              url={`/activity/${activity.activity_id}`}
              sub={`${activity.details[0].name} | Time: ${activity.details[0].duration}mins`} />
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
          type: 1,
          details: {name: 1, duration: 1, image_url: 1, file_url: 1}
        }
      },
      { $limit: 5 }
    ]).toArray()

    //pop the first activity off the array and pass it as the now activity
    //and pass the rest as an array of activities
    const nowActivity = JSON.parse(JSON.stringify(activities.shift()))

    // NextJS is unable to parse complex objects (i.e. objs inside objs)
    // Converting complex objects to simple ones, so that nextjs can understand
    //const properties = JSON.parse(JSON.stringify(data));


    // Connecting to DigitalOcean using s3 sdk
    /*const spacesEndpoint = new AWS.Endpoint('nyc3.digitaloceanspaces.com');
    const s3 = new AWS.S3({
        endpoint: spacesEndpoint,
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
    });

    //Retrieving url for the desired image
    const image_url = s3.getSignedUrl('getObject', {
      Bucket: 'greened-users',
      Key: 'cs.jpg',
      Expires: 60 * 5
    });*/

    return {
      props: {
        user_data: JSON.parse(JSON.stringify(user_data)),
        nowActivity,
        activities: JSON.parse(JSON.stringify(activities))
      },
    }
  }
});