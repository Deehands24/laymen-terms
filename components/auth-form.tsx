"use client"
import { logger } from "../lib/logger"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FadeInSection } from "./fade-in-section"

interface AuthFormProps {
  onAuthSuccess: (userId: number, username: string) => void
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      logger.debug("Submitting auth form:", isLogin ? "login" : "register")

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: isLogin ? "login" : "register",
          username,
          password,
        }),
      })

      logger.debug("Response status:", response.status)
      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
          logger.debug("Response data:", data);
        } catch (e) {
          logger.error("Failed to parse response:", text);
          throw new Error("Invalid server response");
        }
      } catch (e) {
        logger.error("Failed to read response");
        throw new Error("Failed to read server response");
      }

      if (!response.ok) {
        throw new Error(data.error || data.details || "Authentication failed");
      }

      // Call the success callback with user data
      logger.debug("Authentication successful:", data.data)
      onAuthSuccess(data.data.userId, data.data.username)
    } catch (err) {
      console.error("Auth error:", err)
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FadeInSection>
      <Card className="backdrop-blur-sm bg-white/30 border border-gray-100 p-6 shadow-sm">
        <h2 className="text-2xl font-light text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white/50 border-gray-100"
              required
              minLength={3}
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              Username only - no email required for medical confidentiality
            </p>
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/50 border-gray-100"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters
            </p>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-teal-400 to-cyan-500 text-white border-none hover:opacity-90 transition-opacity"
          >
            {isLoading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </Button>

          <p className="text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-teal-500 hover:underline">
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </form>
      </Card>
    </FadeInSection>
  )
}
