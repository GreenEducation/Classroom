import { useUser } from '@auth0/nextjs-auth0'
import Image from 'next/image'
import Link from 'next/link'
import styles from './index.module.scss'

function Header() {
  return (
    <div className={styles.header}>
      <span className={styles.header__left}>
        <Link href="/"><a><h6>Green<b>Ed</b></h6></a></Link>
      </span>
      <span className={styles.header__right}>
        <Link href="/home"><button>Join Now</button></Link>
      </span>
    </div>
  )
}

export default function Index() {

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.body}>

        <h1>Remove Friction from Learning</h1>
        <Link href="/home"><button>Join Now</button></Link>
        <div className={styles.hero}>
          <Image src="/images/hero.png" layout="fill" alt="algorithms on a paper" objectFit="contain"/>
        </div>

        <div className={styles.row}>
          <span>
            <h2>Auto generates todo list</h2>
            <p>GreenEd processes your courses, breaks down your tasks into smaller chunks, and automatically generates a todo list. Thereby removing the overhead.</p>
          </span>
          <span style={{ position:  `relative` }}>
            <Image src="/images/todo.png" layout="fill" alt="algorithms on a paper" objectFit="contain"/>
          </span>
        </div>

        <div className={styles.row}>
          <span style={{ position:  `relative` }}>
            <Image src="/images/home-screenshot.png" layout="fill" alt="algorithms on a paper" objectFit="contain"/>
          </span>
          <span>
            <h2>Surfaces your next tasks</h2>
            <p>Your next task is open and ready to dive into, right on the home page.</p>
          </span>
        </div>

        <div className={styles.row}>
          <span>
            <h2>Comment under activities</h2>
            <p>You can comment and ask questions right under lectures and assignments.</p>
          </span>
          <span style={{ position:  `relative` }}>
            <Image src="/images/comments-screenshot.png" layout="fill" alt="algorithms on a paper" objectFit="contain"/>
          </span>
        </div>

        <div className={styles.row}>
          <span style={{ position:  `relative` }}>
            <Image src="/images/notifications-screenshot.png" layout="fill" alt="algorithms on a paper" objectFit="contain"/>
          </span>
          <span>
            <h2>Get regular reminders</h2>
            <p>You get reminders through out the course, spreading out the work load, so that you are not burdened at the end.</p>
          </span>
        </div>

      </div>
    </div>
  )
}

/*
const { user, error, isLoading } = useUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>
  //TODO: if logged in: redirect users to the home page
  if (!user) {
    return <a href="/api/auth/login">Login</a>
  } else {
    return <Link href="home"><a>Home</a></Link>
  }
*/