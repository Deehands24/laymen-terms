"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FadeInSection } from "@/components/fade-in-section"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

interface SubscriptionPlan {
  id: number
  name: string
  price: number
  features: string[]
  translationsPerMonth: number
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: "Free",
    price: 0,
    translationsPerMonth: 5,
    features: ["5 translations per month", "Basic medical term explanations", "Web access only"],
  },
  {
    id: 2,
    name: "Basic",
    price: 7.99,
    translationsPerMonth: 50,
    features: [
      "50 translations per month",
      "Detailed explanations",
      "Save translation history",
      "Web and mobile access",
    ],
  },
  {
    id: 3,
    name: "Premium",
    price: 14.99,
    translationsPerMonth: 200,
    features: [
      "200 translations per month",
      "Advanced medical explanations",
      "Priority processing",
      "Export to PDF",
      "Web and mobile access",
    ],
  },
  {
    id: 4,
    name: "Professional",
    price: 29.99,
    translationsPerMonth: -1, // Unlimited
    features: [
      "Unlimited translations",
      "Expert-level explanations",
      "Medical diagrams included",
      "API access",
      "Priority support",
      "All platforms access",
    ],
  },
]

export default function SubscriptionPage() {
  const [user, setUser] = useState<{ id: number; username: string } | null>(null)
  const [currentPlan, setCurrentPlan] = useState<number | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setCurrentPlan(1) // Free plan
    }
  }, [])

  const handleSubscribe = async (planId: number) => {
    // In a real app, this would redirect to a payment processor
    alert(`Redirecting to payment for plan ${planId}...`)
  }

  const handleSignOut = () => {
    localStorage.removeItem("user")
    setUser(null)
  }

  if (!user) {
    return (
      <>
        <Navigation user={user} onSignOut={handleSignOut} />

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-light text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
              Sign In to Manage Subscription
            </h1>
            <Card className="p-6 backdrop-blur-sm bg-white/30 border border-gray-100">
              <p className="text-center mb-4">Please sign in to view and manage your subscription.</p>
              <Button asChild className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white">
                <Link href="/">Sign In</Link>
              </Button>
            </Card>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navigation user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
            Subscription Plans
          </h1>
          <Button asChild variant="outline" className="bg-white/30 backdrop-blur-sm hover:bg-white/50">
            <Link href="/">Back to Translator</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {subscriptionPlans.map((plan) => (
            <FadeInSection key={plan.id} delay={(plan.id - 1) * 100}>
              <Card
                className={`p-6 h-full flex flex-col ${
                  currentPlan === plan.id
                    ? "border-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50"
                    : "backdrop-blur-sm bg-white/30 border-gray-100"
                }`}
              >
                <div className="mb-4">
                  <h2 className="text-xl font-medium mb-1">{plan.name}</h2>
                  <p className="text-3xl font-bold mb-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-gray-500">/month</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {plan.translationsPerMonth === -1
                      ? "Unlimited translations"
                      : `${plan.translationsPerMonth} translations per month`}
                  </p>
                </div>

                <ul className="mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start mb-2">
                      <svg
                        className="h-5 w-5 text-teal-500 mr-2 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  className={
                    currentPlan === plan.id
                      ? "bg-gray-300 text-gray-700 cursor-default hover:bg-gray-300"
                      : "bg-gradient-to-r from-teal-400 to-cyan-500 text-white"
                  }
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? "Current Plan" : "Subscribe"}
                </Button>
              </Card>
            </FadeInSection>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-6 backdrop-blur-sm bg-white/30 border border-gray-100">
            <h2 className="text-xl font-medium mb-4">Subscription FAQ</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">How do I change my subscription?</h3>
                <p className="text-gray-600">
                  You can upgrade or downgrade your subscription at any time. Changes take effect at the start of your
                  next billing cycle.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">What happens if I reach my translation limit?</h3>
                <p className="text-gray-600">
                  Once you reach your monthly translation limit, you'll need to wait until your next billing cycle or
                  upgrade to a higher tier to continue translating.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Can I cancel my subscription?</h3>
                <p className="text-gray-600">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until the end of
                  your current billing period.
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Do you offer refunds?</h3>
                <p className="text-gray-600">
                  We offer a 7-day money-back guarantee for new subscribers. Contact our support team for assistance.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  )
}
