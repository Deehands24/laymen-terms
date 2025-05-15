import { type NextRequest, NextResponse } from "next/server"
import { submitMedicalText, saveLaymenTerms } from "@/lib/data-access"
import { translateMedicalText } from "@/lib/ai-service"
import { checkTranslationLimit, incrementTranslationUsage } from "@/lib/subscription-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, medicalText, model } = await request.json()

    if (!userId || !medicalText) {
      return NextResponse.json({ error: "User ID and medical text are required" }, { status: 400 })
    }

    // Check if user has translations remaining
    const { canTranslate, remaining } = await checkTranslationLimit(userId)

    if (!canTranslate) {
      return NextResponse.json(
        {
          error: "Translation limit reached",
          subscription: { remaining: 0 },
        },
        { status: 403 },
      )
    }

    // Submit the medical text
    const submissionId = await submitMedicalText(userId, medicalText)

    // Get AI translation using the specified model or default
    const explanation = await translateMedicalText(medicalText, {
      model: model || "llama3-70b-8192",
    })

    // Save the laymen terms
    const laymenTermId = await saveLaymenTerms(submissionId, explanation)

    // Increment usage counter
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
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Failed to process translation" }, { status: 500 })
  }
}
