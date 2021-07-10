import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import { connectToDatabase } from '../util/mongodb'
import styles from './settings.module.scss'

export default function Settings({ properties }) {

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <h5>Settings</h5>
        <form>
          <input type="text" />
          <input type="text" />
          <input type="text" />
          <button>Save</button>
        </form>
      </div>
    </Layout>
  )
}

//Reserved next.js function to pass props to the react component from the server
export const getServerSideProps = withPageAuthRequired({

  //which page you will go to after logging in
  //returnTo: '/home',

  async getServerSideProps(context) {
    //connectToDatabase on works on the server
    const { db } = await connectToDatabase()

    const data = await db.collection("users").find({}).project({ first_name: 1, account_type: 1 }).limit(10).toArray()
    
    //you can select want properties to request using the .project() method
    const properties = JSON.parse(JSON.stringify(data));

    //optional function to manipulate the data we receive
    const filtered = properties.map(property => {
      return {
        _id: property._id,
        first_name: property.first_name,
        account_type: property.account_type,
      }
    })

    return {
      props: { properties: filtered },
    }
  }
});