import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import styles from './layout.module.scss'
import Header from './header'
import Sidebar from './sidebar'

export const siteTitle = 'GreenEd'

export default function Layout({ children, header, sidebar }) {

  const [showSidebar, setShowSidebar] = useState(true)

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
      <Header user={header} showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      {
        showSidebar &&
        <Sidebar>
          {
            sidebar.this_course ?
              <>
              <select name="courses" id="courses" onChange={(e) => (location = e.target.value)}>
                {
                  sidebar.courses?.map((course) => (
                    <option value={`/course/${course.uid}`} key={course.uid} selected={sidebar.this_course==course.uid}>
                      {course.name}
                    </option>
                  ))
                }
              </select>
              <div>
              {
                sidebar.modules?.map((module) => (
                  <Link href={`/module/${module.uid}`} key={module.uid}>
                    <a>{module.name}</a>
                  </Link>
                ))
              }
              </div>
              </>
            : sidebar.courses?.map((course) => (
                <Link href={`/course/${course.uid}`} key={course.uid}>
                  <a>{course.name}</a>
                </Link>
              ))
          }
        </Sidebar>
      }
      <main className={styles.container__main}
        style={ !showSidebar ? {marginLeft: 0} : {} }>
        {children}
      </main>
    </div>
  )
}