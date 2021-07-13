import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'
import Header from '../components/header' 
import styles from './signup.module.scss'


export default function SignUp({ user_email }) {

  return (
    <div className={styles.container}>
      <Head>
        <title>Sign up | GreenEd</title>
      </Head>
      <Header />
      <div className={styles.container__main}>
        <h5>{new Date().toDateString()}</h5>
        <p>The day you changed your life</p>
        <form className={styles.form}>
          <label for="first-name">First Name</label>
          <input type="text" id="first-name" placeholder="First Name" />
          <br />

          <label for="last-name">Last Name:</label>
          <input type="text" id="last-name" placeholder="Last Name" />
          <br />

          <label for="account-type">Account Type:</label>
          <select name="account-type" id="account-type">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <br />

          <label for="birthday">Birthday:</label>
          <input type="date" id="birthday" name="birthday" />
          <br />

          <input type="submit" value="Submit" />
        </form>

      </div>
    </div>
  )
}

//Reserved next.js function to pass props to the react component from the server
export const getServerSideProps = withPageAuthRequired({

  async getServerSideProps(context) {

    //Get user data from Auth0
    const user_email = getSession(context.req).user.email
    
    //connectToDatabase on works on the server
    const { db } = await connectToDatabase()
    const user_data = await db.collection("users")
      .findOne({ email: user_email }, { projection: {first_name: 1} })

    // Handling the case where the user has finished the sign up process
    if (user_data) {
      return {
        redirect: {
          destination: '/home',
          permanent: false,
        },
      }
    }

    // Passing the email so that it can be stored in mongodb
    return {
      props: { user_email: user_email },
    }
  }
});