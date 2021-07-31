import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import { connectToDatabase } from '../util/mongodb'
import styles from './settings.module.scss'

export default function Chat({ user_data }) {

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
        <h5>Feedback</h5>
        <form className={styles.form} onSubmit={submitForm}>
          <label htmlFor="first-name">First Name</label>
          <input type="text" id="first-name" name="firstName" className={styles.input}
            placeholder="First Name" required />
          <br />

          <label htmlFor="last-name">Last Name:</label>
          <input type="text" id="last-name" name="lastName" className={styles.input}
            placeholder="Last Name" required />
          <br />

          <label htmlFor="account-type">Account Type:</label>
          <select name="account-type" id="accountType" className={styles.input + ' ' + styles.select} required>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <br />

          <label htmlFor="birthday">Birthday:</label>
          <input type="date" id="birthday" name="birthday" className={styles.input} required />
          <br />

          <input type="submit" value="Submit" className={styles.input + ' ' + styles.button}  />
        </form>
      </div>
    </Layout>
  )
}

//Reserved next.js function to pass props to the react component from the server
export const getServerSideProps = withPageAuthRequired({

  async getServerSideProps(context) {

    //Get user data from Auth0
    const user_email = getSession(context.req).user.email

    //connectToDatabase on works on the server
    const { db } = await connectToDatabase()

    // Querying basic user data
    const user_data = await db.collection("users")
      .findOne({ email: user_email },
               { projection: {first_name: 1, profile_pic: 1, account_type: 1, active_courses: 1} })

    return {
      props: {
        user_data: JSON.parse(JSON.stringify(user_data))
      },
    }
  }
});