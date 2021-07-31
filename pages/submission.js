import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import Link from 'next/link'
import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'
import Layout, { siteTitle } from '../components/layout'
import Card from '../components/card'
import Table from '../components/table'
import styles from './submission.module.scss'

export default function Submission({user_data, activities_set}) {
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
        <div className={styles.head}>
          <h6>Submissions {`>`} Math 138</h6>
          <span>
            <label className={styles.dropdownLabel} for="sort">Sort</label>
            <select className={styles.dropdown} name="sort" id="sort">
              <option value="default">Default</option>
              <option value="task-type">Task Type</option>
              <option value="module">Module</option>
              <option value="due-date">Due Date</option>
            </select>
          </span>
        </div>
        {
          activities_set?.map((activities) => (
            <Card className={styles.card}>
              <h6>{activities[0].course_name}</h6>
              <Table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Module</th>
                    <th>Due Date</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    activities.map((activity) => (
                      <tr>
                        <td><Link href={`/activity/${activity._id}`}><a>{activity.name}</a></Link></td>
                        <td>
                          <Link href={`/module/${activity.module[0]._id}`}><a>
                          {activity.module[0].name}
                          </a></Link>
                        </td>
                        <td>{new Date(activity.due_dates[0]).toDateString()}</td>
                        <td>{activity.final_percentage}%</td>
                      </tr>
                    ))
                  }
                  <tr>
                    <td>Assignment 2</td>
                    <td>Week 2</td>
                    <td>16 June 2021</td>
                    <td>89%</td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          ))
        }
      </div>
    </Layout>
  )
}


export const getServerSideProps = withPageAuthRequired({

  // Querying data and passing them as props
  async getServerSideProps(context) {

    //Get user data from Auth0
    const user_email = getSession(context.req).user.email

    const { db } = await connectToDatabase()

    // Querying basic user data
    const user_data = await db.collection("users")
      .findOne({ email: user_email },
               { projection: {first_name: 1, profile_pic: 1, active_courses: 1} })
    
    // Querying activities based on the user's id
    const active_course_ids = user_data.active_courses.map((course) => (course.uid))
    const activities = await db.collection("activities").aggregate([
      { $match: {
        course_id: { $in: active_course_ids },
        activity_type: { $in: ['quiz','assignment','exam'] }
      }},
      { $sort: { course_id: 1, activity_type: 1, order: 1} },
      {
        $lookup: {
          from: "modules",
          localField: "module_id",
          foreignField: "_id",
          as: "module"
        } 
      },
      {
        $project: {
          name: 1,
          due_dates: 1,
          course_id: 1,
          course_name: 1,
          final_percentage: 1,
          module: {
            _id: 1,
            name: 1
          }
        }
      }
    ]).toArray()


    const activities_set = active_course_ids.map((course_id) => {
      return activities.filter((activity) => (activity.course_id.toString()===course_id.toString()))
    })


    return {
      props: {
        activities_set: JSON.parse(JSON.stringify(activities_set)),
        user_data: JSON.parse(JSON.stringify(user_data))
      },
    }
  }
});