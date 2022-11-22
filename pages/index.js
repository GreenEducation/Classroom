//import Head from 'next/head'
import { useState } from 'react'
import Layout from '../components/layout'

export default function Home() {

  const [registered, setRegistered] = useState(false);

  return (
    <Layout background={registered ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"}>

      <main className="flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold">
          {registered ? 'Registered' : 'GreenEd'}
        </h1><br /><br />
        <input type="text" placeholder="Email Address" className="h-10 w-96 border-2 rounded-full pl-4 text-neutral-900 border-neutral-900" />
        <button className="underline m-2" onClick={()=>setRegistered(true)}>Register For Early Access</button>
      </main>

    </Layout>
  )
}
