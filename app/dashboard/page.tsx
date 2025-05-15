"use client"

import { useState, useEffect } from "react"
import { ResultsTable } from "@/components/results-table"
import { AuthForm } from "@/components/auth-form"
import { Navigation } from "@/components/navigation"

export default function Dashboard() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleAuthSuccess = (userId: number, username: string) => {
    const userData = { id: userId, username }
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const handleSignOut = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  return (
    <>
      <Navigation user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-12">
        {user ? (
          <>
            <h1 className="text-3xl font-light mb-8 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
              Translation History
            </h1>

            <ResultsTable userId={user.id} />
          </>
        ) : (
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-light text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
              Sign In to View History
            </h1>
            <AuthForm onAuthSuccess={handleAuthSuccess} />
          </div>
        )}
      </main>
    </>
  )
}
