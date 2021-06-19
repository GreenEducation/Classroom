import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import Card from '../components/card'
import styles from './index.module.scss'

export default function Home() {

  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <Card>
          
        </Card>
      </div>
    </Layout>
  )
}
