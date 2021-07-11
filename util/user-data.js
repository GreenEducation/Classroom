
export async function getUser() {
  const data = await fetch("http://localhost:3000/api/auth/me")
  const userData = await data.json()
  return userData
}