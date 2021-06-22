import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import BigHero from '../components/big-hero'
import ActivityCard from '../components/activity-card'
import Checklist from '../components/checklist'
import styles from './week.module.scss'

export default function Week() {
  return (
    <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.main}>

          <div className={styles.main__left}>
            <BigHero>
              <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jjqgP9dpD1k"
                  title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen></iframe>
            </BigHero>
            <div className={styles.upNext}>
              <small>Up next</small>
              <ActivityCard layout="horizontal" image="/images/math.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" />
            </div><br />
            <div className={styles.content}>
              <small>Content for week 1</small>
              <ActivityCard layout="horizontal" image="/images/math.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" /><br />
              <ActivityCard layout="horizontal" image="/images/english.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" /><br />
              <ActivityCard layout="horizontal" image="/images/physics.jpg" main="Chapter 1.5" sub="Math 138 | Reading time: ~17 mins" /><br />
            </div>
          </div>

          <div className={styles.main__right}>
          <Checklist title="Submissions" items={[["Assignment 2", true], ["Assignment 3", false], ["Assignment 4", true]]} />
            <Checklist title="Due this week" items={[["Assignment 2", true], ["Assignment 3", false], ["Assignment 4", true]]} />
            <Checklist title="To Do" items={[["Assignment 2", true], ["Assignment 3", false], ["Quiz 3", true]]} />
          </div>
          
        </div>
      </div>
    </Layout>
  )
}
