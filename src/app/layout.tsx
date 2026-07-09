import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientLayout from '@/components/layout/ClientLayout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Personal Finance Manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        <ToastContainer position="bottom-right" />
      </body>
    </html>
  )
}