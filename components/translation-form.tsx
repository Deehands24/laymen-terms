"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { FadeInSection } from "./fade-in-section"
import { ModelInfo } from "./model-info"
import { LoadingIndicator } from "./loading-indicator"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TranslationFormProps {
  userId: number
}

export function TranslationForm({ userId }: TranslationFormProps) {
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [subscription, setSubscription] = useState<{
    remaining: number
    limit: number
  } | null>(null)
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState<string>("llama3-70b-8192")
  const [showModelInfo, setShowModelInfo] = useState(false)

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models")
        const data = await response.json()

        if (response.ok && data.success) {
          setModels(data.data)
        }
      } catch (error) {
        console.error("Error fetching models:", error)
      }
    }

    fetchModels()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    setIsLoading(true)
    setError("")
    setResult("")

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          medicalText: inputText,
          model: selectedModel,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          // Subscription limit reached
          setSubscription(data.subscription)
          throw new Error("You've reached your translation limit for this month. Please upgrade your plan to continue.")
        } else {
          throw new Error(data.error || "Translation failed")
        }
      }

      setResult(data.data.explanation)
      setSubscription(data.data.subscription)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {subscription && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {subscription.limit === -1 ? (
              <span>Unlimited translations available</span>
            ) : (
              <span>
                {subscription.remaining} of {subscription.limit} translations remaining this month
              </span>
            )}
          </div>
          <Button asChild variant="outline" size="sm" className="bg-white/30 backdrop-blur-sm hover:bg-white/50">
            <Link href="/subscription">Manage Subscription</Link>
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="backdrop-blur-sm bg-white/30 rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter medical text here..."
            className="w-full p-4 min-h-[150px] bg-transparent focus:outline-none resize-none"
            required
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="w-full sm:w-64">
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                setSelectedModel(value)
                setShowModelInfo(true)
                // Hide model info after 10 seconds
                setTimeout(() => setShowModelInfo(false), 10000)
              }}
            >
              <SelectTrigger className="bg-white/50 backdrop-blur-sm border-gray-100">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-none hover:opacity-90 transition-opacity"
          >
            {isLoading ? "Translating..." : "Translate"}
          </Button>
        </div>

        {showModelInfo && (
          <FadeInSection>
            <ModelInfo modelId={selectedModel} />
          </FadeInSection>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
                {error.includes("limit") && (
                  <div className="mt-2">
                    <Button asChild size="sm" className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white">
                      <Link href="/subscription">Upgrade Plan</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>

      {isLoading && (
        <FadeInSection>
          <Card className="overflow-hidden backdrop-blur-sm bg-white/30 border border-gray-100">
            <div className="p-6">
              <h3 className="text-xl font-medium mb-3 text-center">Translating Medical Text</h3>
              <LoadingIndicator />
              <p className="text-center text-gray-500 mt-4">
                Converting complex medical terminology into simple language...
              </p>
            </div>
          </Card>
        </FadeInSection>
      )}

      {!isLoading && result && (
        <FadeInSection>
          <Card className="overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-600 border-none shadow-lg">
            <div className="p-6 text-white">
              <h3 className="text-xl font-medium mb-3">Simplified Explanation</h3>
              <p className="whitespace-pre-line">{result}</p>
            </div>
          </Card>
        </FadeInSection>
      )}
    </div>
  )
}
