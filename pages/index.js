//import Head from 'next/head'
import { useState } from 'react'
import Layout from '../components/layout'

export default function Home() {

  const [registered, setRegistered] = useState(false);

  return (
    <Layout background={registered ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"}>

      <main className="flex flex-col justify-center items-start mx-2">
        <h1 className="text-4xl font-bold">
          {registered ? 'We will email you soon. Thanks!' : 'Register for early access.'}
        </h1><br /><br />
        <input type="text" placeholder="Email Address" className="h-10 w-96 border-2 rounded-full pl-4 text-neutral-900 border-neutral-900" />
        <button className="underline m-2 font-semibold" onClick={()=>setRegistered(true)}>Submit</button>
      </main>

    </Layout>
  )
}
