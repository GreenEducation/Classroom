import Head from 'next/head'
import Link from 'next/link'
import styles from './layout.module.scss'
import Header from './header'
import Sidebar from './sidebar'

export const siteTitle = 'GreenEd'

export default function Layout({ children, home }) {

  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content="Learn how to build a personal website using Next.js"
        />
        <meta
          property="og:image"
          content={`https://og-image.vercel.app/${encodeURI(
            siteTitle
          )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.zeit.co%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Header />
      <Sidebar>
        <Link href="course"><a className={styles.sidebar__link}>Math 138</a></Link>
        <Link href="course"><a className={styles.sidebar__link}>Math 237</a></Link>
        <Link href="course"><a className={styles.sidebar__link}>CS 246</a></Link>
        <Link href="course"><a className={styles.sidebar__link}>Psych 245</a></Link>
      </Sidebar>
      <main className={styles.container__main}>{children}</main>
    </div>
  )
}