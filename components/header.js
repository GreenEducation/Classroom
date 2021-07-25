import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './header.module.scss'

export default function Header({ user, showSidebar, setShowSidebar }) {

  const [showDropDown, setShowDropDown] = useState(false)

  return (
    <div className={styles.header}>
      <span className={styles.header__left}>
        <div className={styles.header__hamburger}
          onClick={() =>
            setShowSidebar(!showSidebar)
          }>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <Link href="/home"><a><h6>GreenEd</h6></a></Link>
      </span>
      <span className={styles.header__right}
        onMouseEnter={() => setShowDropDown(true)}
        onMouseLeave={() => setShowDropDown(false)}
      >
        <div className={styles.profile}>
          <div className={styles.profile__pic}>
            <Image
              src={user.profile_pic}
              layout="fill"
              alt={`${user.first_name}'s profile picture`}
              objectFit="cover"
            />
          </div>
        </div>
        {
          showDropDown &&
          <div className={styles.profile__dropdown}>
            <Link href='/profile'>
              <a>Profile</a>
            </Link>
            <Link href='/settings'>
              <a>Setting</a>
            </Link>
            <Link href='/api/auth/logout'>
              <a>&larr; Logout</a>
            </Link>
          </div>
        }
      </span>
    </div>
  )
}
