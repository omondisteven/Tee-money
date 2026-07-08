// 'use client'

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import LoadingSpinner from './LoadingSpinner'

// export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const [loading, setLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const res = await fetch('/api/auth/me')
//         if (!res.ok) {
//           router.push('/login')
//         }
//       } catch (error) {
//         router.push('/login')
//       } finally {
//         setLoading(false)
//       }
//     }

//     checkAuth()
//   }, [router])

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner />
//       </div>
//     )
//   }

//   return <>{children}</>
// }