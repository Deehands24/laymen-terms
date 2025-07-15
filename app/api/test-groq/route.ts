import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

import { logger } from "@/lib/logger"
export async function GET(request: NextRequest) {
  try {
    logger.debug("Testing Groq connection...")

    // Simple test to check if Groq is working
    const { text } = await generateText({
      model: groq("llama3-8b-8192"), // Using a smaller model for the test
      prompt: "Translate this medical term to simple language: hypertension",
      system: "You are a helpful medical translator.",
    })

    return NextResponse.json({
      success: true,
      message: "Groq connection successful",
      sample: text,
    })
  } catch (error) {
    console.error("Groq test failed:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to Groq",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
