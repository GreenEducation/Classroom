export default function Layout({ children, background }) {
  return (
    <div className={"container h-screen flex justify-center items-cente " + background}>
      {children}
    </div>
  )
}