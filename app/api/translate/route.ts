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
      const { canTranslate, remaining } = await checkTranslationLimit(userId)

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

      // Performance Optimization: Run DB submission and AI translation in parallel
      // This significantly reduces latency by overlapping the database write with the external API call
      logger.debug("Starting parallel execution: submitMedicalText + translateMedicalText")

      const submissionPromise = submitMedicalText(userId, medicalText)
      const translationPromise = translateMedicalText(medicalText, {
        model: model || "llama3-70b-8192",
      })

      const [submissionId, explanation] = await Promise.all([
        submissionPromise,
        translationPromise
      ])

      logger.debug("Parallel execution finished. Submission ID:", submissionId, "Translation length:", explanation.length)

      // Performance Optimization: Run saving result and incrementing usage in parallel
      // These are independent DB operations that can run concurrently
      logger.debug("Starting parallel execution: saveLaymenTerms + incrementTranslationUsage")

      const saveTermsPromise = saveLaymenTerms(submissionId, explanation)
      const incrementUsagePromise = incrementTranslationUsage(userId)

      const [laymenTermId] = await Promise.all([
        saveTermsPromise,
        incrementUsagePromise
      ])

      logger.debug("Parallel execution finished. Laymen term ID:", laymenTermId)

      // Get updated remaining count
      // Note: We await this after increment is done to ensure we get the latest count
      const updatedLimit = await checkTranslationLimit(userId)

      return NextResponse.json({
        success: true,
        data: {
          submissionId,
          laymenTermId,
          explanation,
          subscription: {
            remaining: updatedLimit.remaining,
            limit: updatedLimit.limit,
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
