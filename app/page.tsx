"use client"

import { useState, useEffect } from "react"
import { TranslationForm } from "@/components/translation-form"
import { AuthForm } from "@/components/auth-form"
import { FadeInSection } from "@/components/fade-in-section"
import { Navigation } from "@/components/navigation"

export default function Home() {
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
        <FadeInSection>
          <h1 className="text-4xl font-light tracking-tight text-center mb-2">
            Medical Terms{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">Translator</span>
          </h1>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Translate complex medical terminology into simple, easy-to-understand language
          </p>
        </FadeInSection>

        <div className="max-w-3xl mx-auto">
          {user ? <TranslationForm userId={user.id} /> : <AuthForm onAuthSuccess={handleAuthSuccess} />}
        </div>
      </main>
    </>
  )
}
