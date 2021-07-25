import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import { connectToDatabase } from '../util/mongodb'
import Header from '../components/header' 
import styles from './signup.module.scss'

/*
TODO:
Style the form
Send api request
redirect to home on success
*/

export default function SignUp({ user_email }) {

  //TODO: change the url to greened.app
  const submitForm = async (event) => {
    event.preventDefault()

    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        {
          id: 0,
          first_name: event.target.firstName.value,
          last_name: event.target.lastName.value,
          email: user_email,
          phone: '',
          school: '',
          profile_pic: 'https://greened-users.nyc3.digitaloceanspaces.com/user.png',
          date_of_birth: event.target.birthday.value,
          date_created: new Date().toISOString(),
          notifications: [],
          active_course: [],
          archived_courses: [],
          account_type: event.target.accountType.value,
          deleted: false
        }
      )
    })

    console.log(res.json())
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Sign up | GreenEd</title>
      </Head>
      <Header />
      <div className={styles.container__main}>

        <h5>{new Date().toDateString()}</h5>
        <p>The day you changed your life</p>

        <form className={styles.form} onSubmit={submitForm}>
          <label htmlFor="first-name">First Name</label>
          <input type="text" id="first-name" name="firstName" placeholder="First Name" required />
          <br />

          <label htmlFor="last-name">Last Name:</label>
          <input type="text" id="last-name" name="lastName" placeholder="Last Name" required />
          <br />

          <label htmlFor="account-type">Account Type:</label>
          <select name="account-type" id="accountType" required>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <br />

          <label htmlFor="birthday">Birthday:</label>
          <input type="date" id="birthday" name="birthday" required />
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