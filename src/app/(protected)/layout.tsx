// src/app/(protected)/layout.tsx
'use client'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}