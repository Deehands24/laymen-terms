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
            Translate complex medical terminology into simple, easy-to-understand language using AI. Perfect for understanding medical reports, prescriptions, and diagnoses.
          </p>
        </FadeInSection>

        <div className="max-w-3xl mx-auto">
          {user ? <TranslationForm userId={user.id} /> : <AuthForm onAuthSuccess={handleAuthSuccess} />}
        </div>

        {/* SEO Content Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-teal-600">AI-Powered</h2>
              <p className="text-gray-600">Advanced AI translates medical jargon into plain language instantly</p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-teal-600">Patient-Friendly</h2>
              <p className="text-gray-600">Explanations anyone can understand, no medical degree required</p>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-teal-600">Always Available</h2>
              <p className="text-gray-600">Get instant translations 24/7 from any device</p>
            </div>
          </div>

          <article className="prose prose-lg max-w-none text-gray-700">
            <h2 className="text-2xl font-semibold mb-4">Understanding Medical Terminology Made Easy</h2>
            <p className="mb-4">
              Medical terminology can be confusing and overwhelming for patients. Our AI-powered medical terms translator helps you understand complex medical language from doctor&apos;s reports, lab results, prescriptions, and diagnoses. Whether you&apos;re trying to understand a diagnosis, medication instructions, or test results, we make medical language accessible to everyone.
            </p>
            <h3 className="text-xl font-semibold mb-3">How It Works</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Enter or paste any medical text you need translated</li>
              <li>Our AI analyzes the medical terminology</li>
              <li>Get an instant, easy-to-understand explanation in plain language</li>
              <li>Save your translation history for future reference</li>
            </ul>
            <h3 className="text-xl font-semibold mb-3">Perfect For</h3>
            <ul className="list-disc pl-6">
              <li>Understanding medical reports and lab results</li>
              <li>Decoding prescription medication instructions</li>
              <li>Learning about medical diagnoses and conditions</li>
              <li>Preparing questions for your healthcare provider</li>
              <li>Medical students studying terminology</li>
            </ul>
          </article>
        </section>
      </main>
    </>
  )
}
