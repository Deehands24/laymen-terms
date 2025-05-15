import { type NextRequest, NextResponse } from "next/server"
import { getAvailableModels } from "@/lib/ai-service"

export async function GET(request: NextRequest) {
  try {
    const models = await getAvailableModels()

    return NextResponse.json({
      success: true,
      data: models,
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch available models" }, { status: 500 })
  }
}
