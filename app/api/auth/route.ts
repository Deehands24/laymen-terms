import { type NextRequest, NextResponse } from "next/server"
import { getUserByUsername, createUser } from "@/lib/data-access"
import { registerUser, loginUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Add CORS headers for cross-origin requests
  const origin = request.headers.get("origin") || ""
  const allowedOrigins = ["https://your-deployed-url.vercel.app", "http://localhost:3000"]

  const headers = new Headers()
  if (allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin)
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  headers.set("Access-Control-Allow-Headers", "Content-Type")

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }

  try {
    console.log("Auth API route called")
    const body = await request.json()
    console.log("Request body:", body)

    const { action, username, password } = body

    if (!username || !password) {
      console.log("Missing username or password")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400, headers })
    }

    if (action === "login") {
      console.log("Login attempt for:", username)
      const result = await loginUser(username, password)
      return NextResponse.json({ data: result }, { headers })
    } else if (action === "register") {
      console.log("Registration attempt for:", username)
      const user = await registerUser(username, password)
      return NextResponse.json({ data: { userId: user.id, username: user.username } }, { headers })
    } else {
      console.log("Invalid action:", action)
      return NextResponse.json({ error: "Invalid action" }, { status: 400, headers })
    }
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication failed" },
      { status: 500, headers }
    )
  }
}
