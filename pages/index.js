import { useUser } from '@auth0/nextjs-auth0'
import Link from 'next/link'

export default function Index() {

  const { user, error, isLoading } = useUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>{error.message}</div>
  //TODO: if logged in: redirect users to the home page
  if (!user) {
    return <a href="/api/auth/login">Login</a>
  } else {
    return <Link href="home"><a>Home</a></Link>
  }
}