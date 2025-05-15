import { type NextRequest, NextResponse } from "next/server"
import { getUserTranslations } from "@/lib/data-access"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const translations = await getUserTranslations(Number.parseInt(userId, 10))

    return NextResponse.json({
      success: true,
      data: translations,
    })
  } catch (error) {
    console.error("Error fetching history:", error)
    return NextResponse.json({ error: "Failed to fetch translation history" }, { status: 500 })
  }
}
