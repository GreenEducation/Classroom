import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import { connectToDatabase } from '../util/mongodb'
import styles from './settings.module.scss'
const AWS = require('aws-sdk');

/**
 * Send the file name to a local api
 * Use createPresignedPost to get a link
 *  to upload the file directly from the HTML form
 */
export default function AddCourse({ user_data }) {

  async function uploadFile() {

    var files = document.getElementById("file_upload").files
    if (!files.length) {
      return alert("Please choose a file to upload first.")
    }
    var file = files[0]
    console.log(file.name)

    const res = await fetch(`/api/upload-url?file=${file.name}`);
    const { url, fields } = await res.json();
    const formData = new FormData();

    Object.entries({ ...fields, file }).forEach(([key, value]) => {
      formData.append(key, value);
    });

    console.log(url)
    const upload = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (upload.ok) {
      console.log('Uploaded successfully!');
    } else {
      console.error('Upload failed.');
    }
  }


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
        <h5>Add a Course</h5>
        <input id="file_upload" type="file" accept="image/*" />
        <button id="upload" onClick={(event) => {event.preventDefault; uploadFile()}}>Upload</button>
      </div>
    </Layout>
  )
}


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
})