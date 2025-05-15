import { type NextRequest, NextResponse } from "next/server"
import { getUserByUsername, createUser } from "@/lib/data-access"

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
      // In a real app, you would verify the password
      try {
        const user = await getUserByUsername(username)
        console.log("User found:", user ? "Yes" : "No")

        if (!user) {
          return NextResponse.json({ error: "Invalid username or password" }, { status: 401, headers })
        }

        return NextResponse.json(
          {
            success: true,
            data: { userId: user.id, username: user.username },
          },
          { headers },
        )
      } catch (dbError) {
        console.error("Database error during login:", dbError)
        throw dbError
      }
    } else if (action === "register") {
      console.log("Registration attempt for:", username)
      // Check if user already exists
      try {
        const existingUser = await getUserByUsername(username)
        console.log("Existing user found:", existingUser ? "Yes" : "No")

        if (existingUser) {
          return NextResponse.json({ error: "Username already exists" }, { status: 409, headers })
        }

        // Create new user
        const userId = await createUser(username, password)
        console.log("User created with ID:", userId)

        return NextResponse.json(
          {
            success: true,
            data: { userId, username },
          },
          { headers },
        )
      } catch (dbError) {
        console.error("Database error during registration:", dbError)
        throw dbError
      }
    } else {
      console.log("Invalid action:", action)
      return NextResponse.json({ error: "Invalid action" }, { status: 400, headers })
    }
  } catch (error) {
    console.error("Authentication error:", error)
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorStack = error instanceof Error ? error.stack : ""
    return NextResponse.json(
      {
        error: "Authentication failed",
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500, headers },
    )
  }
}
