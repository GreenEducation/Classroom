import { withPageAuthRequired, getSession } from '@auth0/nextjs-auth0'
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import { connectToDatabase } from '../util/mongodb'
import styles from './settings.module.scss'
const AWS = require('aws-sdk');


export default function AddCourse({ user_data }) {

  const spacesEndpoint = new AWS.Endpoint('https://greened-users.nyc3.digitaloceanspaces.com');
  const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
  });

  function uploadFile() {

    var files = document.getElementById("file_upload").files
    if (!files.length) {
      return alert("Please choose a file to upload first.")
    }
    var file = files[0]
    console.log(file.name)

    var params = {
      Bucket: "greened-users",
      Key: file.name,
      Body: file,
      ACL: "private"
    };
    
    s3.putObject(params, function(err, data) {
      if (err) {console.log(err, err.stack);}
      else     {console.log(data);}
    });

    

    /*
    // Use S3 ManagedUpload class as it supports multipart uploads
    var upload = new AWS.S3.ManagedUpload({
      params: {
        Bucket: "greened-users",
        Key: file.name,
        Body: file
      }
    })

    var promise = upload.promise()
    promise.then(
      function(data) {
        alert("Successfully uploaded photo.")
      },
      function(err) {
        return alert("There was an error uploading your photo: ", err.message)
      }
    )
    */
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