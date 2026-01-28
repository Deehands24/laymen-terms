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
      const { canTranslate, remaining: initialRemaining, limit } = await checkTranslationLimit(userId)

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

      // Parallelize submission and translation
      // This saves time by running the DB insert and LLM API call concurrently
      logger.debug("Starting parallel submission and translation for user:", userId)
      const submissionPromise = submitMedicalText(userId, medicalText)
      const translationPromise = translateMedicalText(medicalText, {
        model: model || "llama3-70b-8192",
      })

      const [submissionId, explanation] = await Promise.all([submissionPromise, translationPromise])
      logger.debug("Parallel execution completed. SubmissionId:", submissionId, "Translation length:", explanation.length)

      // Parallelize saving results and incrementing usage
      // We can start incrementing usage immediately as we have a successful translation
      logger.debug("Starting parallel save and increment")
      const savePromise = saveLaymenTerms(submissionId, explanation)
      const incrementPromise = incrementTranslationUsage(userId)

      const [laymenTermId] = await Promise.all([savePromise, incrementPromise])
      logger.debug("Laymen terms saved with ID:", laymenTermId)

      // Calculate new remaining limit locally instead of querying DB again
      // This saves one database round-trip
      let newRemaining = initialRemaining
      if (limit !== -1 && initialRemaining > 0) {
        newRemaining = initialRemaining - 1
      }

      return NextResponse.json({
        success: true,
        data: {
          submissionId,
          laymenTermId,
          explanation,
          subscription: {
            remaining: newRemaining,
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
