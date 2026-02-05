import { type NextRequest, NextResponse } from "next/server"
import { submitMedicalText, saveLaymenTerms } from "@/lib/data-access"
import { translateMedicalText } from "@/lib/ai-service"
import { checkTranslationLimit, incrementTranslationUsage } from "@/lib/subscription-service"

import { logger } from "@/lib/logger"
export async function POST(request: NextRequest) {
  try {
    logger.debug("Translation API route called")
    const body = await request.json()
    logger.debug("Request body (without text):", { ...body, medicalText: "[REDACTED]" })

    const { userId, medicalText, model } = body

    if (!userId || !medicalText) {
      logger.debug("Missing userId or medicalText")
      return NextResponse.json({ error: "User ID and medical text are required" }, { status: 400 })
    }

    try {
      // Check if user has translations remaining
      const { canTranslate, remaining, limit } = await checkTranslationLimit(userId)

      if (!canTranslate) {
        logger.debug("Translation limit reached for user:", userId)
        return NextResponse.json(
          {
            error: "Translation limit reached",
            subscription: { remaining: 0 },
          },
          { status: 403 },
        )
      }

      // Submit the medical text and get translation in parallel
      logger.debug("Starting parallel submission and translation for user:", userId)
      logger.debug("Requesting translation with model:", model || "llama3-70b-8192")

      const [submissionId, explanation] = await Promise.all([
        submitMedicalText(userId, medicalText),
        translateMedicalText(medicalText, {
          model: model || "llama3-70b-8192",
        }),
      ])

      logger.debug("Submission created with ID:", submissionId)
      logger.debug("Translation received, length:", explanation.length)

      // Save the laymen terms and increment usage in parallel
      logger.debug("Starting parallel save and increment for submission:", submissionId)

      const [laymenTermId] = await Promise.all([
        saveLaymenTerms(submissionId, explanation),
        incrementTranslationUsage(userId),
      ])

      logger.debug("Laymen terms saved with ID:", laymenTermId)

      // Calculate updated limit locally
      const updatedRemaining = remaining === -1 ? -1 : Math.max(0, remaining - 1)

      return NextResponse.json({
        success: true,
        data: {
          submissionId,
          laymenTermId,
          explanation,
          subscription: {
            remaining: updatedRemaining,
            limit: limit,
          },
        },
      })
    } catch (innerError) {
      console.error("Error in translation process:", innerError)

      // If there's an error in the translation process but we can still generate a response,
      // return a simplified error response with the translation
      const fallbackExplanation = await translateMedicalText(medicalText, {
        model: "llama3-8b-8192", // Use a smaller model as fallback
      }).catch(() => {
        return `We couldn't process your request fully, but here's the original text: "${medicalText}"`
      })

      return NextResponse.json({
        success: true,
        data: {
          submissionId: -1,
          laymenTermId: -1,
          explanation: fallbackExplanation,
          subscription: {
            remaining: 5,
            limit: 5,
          },
          partial: true,
        },
      })
    }
  } catch (error) {
    console.error("Translation API error:", error)
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Failed to process translation",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
