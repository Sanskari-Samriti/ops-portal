'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Root() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login')
  }, [router])

  return (
    <main className="p-8 text-center">
      <p>Redirecting to the admin sign-in page...</p>
      <Link className="text-orange-600 underline" href="/login">
        Continue to sign in
      </Link>
    </main>
  )
}
