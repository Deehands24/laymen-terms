import { type NextRequest, NextResponse } from "next/server"
import { submitMedicalText, saveLaymenTerms } from "@/lib/data-access"
import { translateMedicalText } from "@/lib/ai-service"
import { checkTranslationLimit, incrementTranslationUsage } from "@/lib/subscription-service"

export async function POST(request: NextRequest) {
  try {
    console.log("Translation API route called")
    const body = await request.json()
    console.log("Request body (without text):", { ...body, medicalText: "[REDACTED]" })

    const { userId, medicalText, model } = body

    if (!userId || !medicalText) {
      console.log("Missing userId or medicalText")
      return NextResponse.json({ error: "User ID and medical text are required" }, { status: 400 })
    }

    try {
      // Check if user has translations remaining
      const { canTranslate, remaining } = await checkTranslationLimit(userId)

      if (!canTranslate) {
        console.log("Translation limit reached for user:", userId)
        return NextResponse.json(
          {
            error: "Translation limit reached",
            subscription: { remaining: 0 },
          },
          { status: 403 },
        )
      }

      // Submit the medical text
      console.log("Submitting medical text for user:", userId)
      const submissionId = await submitMedicalText(userId, medicalText)
      console.log("Submission created with ID:", submissionId)

      // Get AI translation using the specified model or default
      console.log("Requesting translation with model:", model || "llama3-70b-8192")
      const explanation = await translateMedicalText(medicalText, {
        model: model || "llama3-70b-8192",
      })
      console.log("Translation received, length:", explanation.length)

      // Save the laymen terms
      console.log("Saving laymen terms for submission:", submissionId)
      const laymenTermId = await saveLaymenTerms(submissionId, explanation)
      console.log("Laymen terms saved with ID:", laymenTermId)

      // Increment usage counter
      console.log("Incrementing usage counter for user:", userId)
      await incrementTranslationUsage(userId)

      // Get updated remaining count
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
