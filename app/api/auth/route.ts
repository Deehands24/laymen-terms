import { type NextRequest, NextResponse } from "next/server"
import { getUserByUsername, createUser } from "@/lib/data-access"
import { registerUser, loginUser } from '@/lib/auth'

import { logger } from "@/lib/logger"
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
    logger.debug('Auth API route called with env vars:', {
      hasServer: !!process.env.DB_SERVER,
      hasDatabase: !!process.env.DB_DATABASE,
      hasUser: !!process.env.DB_USER,
      hasPassword: !!process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
    });

    const body = await request.json()
    logger.debug("Request body:", body)

    const { action, username, password } = body

    if (!username || !password) {
      logger.debug("Missing username or password")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400, headers })
    }

    try {
      if (!username || !password) {
        return NextResponse.json({ error: "Username and password are required" }, { status: 400, headers });
      }

      if (action === "login") {
        logger.debug("Starting login for:", username);
        try {
          const result = await loginUser(username, password);
          logger.debug("Login successful for:", username);
          return NextResponse.json({ data: { userId: result.user.id, username: result.user.username } }, { headers });
        } catch (error) {
          logger.error("Login failed:", error);
          return NextResponse.json({ 
            error: error instanceof Error ? error.message : "Login failed",
            details: error instanceof Error ? error.stack : undefined
          }, { status: 401, headers });
        }
      } else if (action === "register") {
        logger.debug("Starting registration for:", username);
        try {
          const user = await registerUser(username, password);
          logger.debug("Registration successful for:", username);
          return NextResponse.json({ data: { userId: user.id, username: user.username } }, { headers });
        } catch (error) {
          logger.error("Registration failed:", error);
          return NextResponse.json({ 
            error: error instanceof Error ? error.message : "Registration failed",
            details: error instanceof Error ? error.stack : undefined
          }, { status: 400, headers });
        }
      } else {
        logger.debug("Invalid action:", action);
        return NextResponse.json({ error: "Invalid action" }, { status: 400, headers });
      }
    } catch (actionError: any) {
      console.error("Action error details:", {
        message: actionError?.message,
        stack: actionError?.stack,
        code: actionError?.code,
        name: actionError?.name
      })
      throw actionError
    }
  } catch (error: any) {
    console.error("Auth error:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      name: error?.name
    })
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Authentication failed",
        details: error instanceof Error ? error.stack : "No stack trace available"
      },
      { status: 500, headers }
    )
  }
}
