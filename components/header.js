import { useUser } from '@auth0/nextjs-auth0';
import styles from './header.module.scss'

export default function Header() {

  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  let content = user ? user.name : <a href="/api/auth/login">Login</a>

  return (
    <div className={styles.header}>
      <span>
        <div className={styles.header__hamburger}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </span>
      <span>
        {content}
      </span>
    </div>
  )
}
