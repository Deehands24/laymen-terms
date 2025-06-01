import sql from "mssql"

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === "production"

// Use environment variables if available, otherwise fall back to hardcoded values
const config: sql.config = {
  server: process.env.DB_SERVER || "",
  database: process.env.DB_DATABASE || "",
  user: process.env.DB_USER || "",
  password: process.env.DB_PASSWORD || "",
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
}

console.log("Database config (without password):", {
  ...config,
  password: "******", // Don't log the actual password
})

// Database connection pool
let pool: sql.ConnectionPool | null = null

export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (pool) {
      return pool
    }
    
    console.log("Attempting database connection with config:", {
      ...config,
      password: "******",
    })
    
    pool = await new sql.ConnectionPool(config).connect()
    console.log("Database connection successful!")
    return pool
  } catch (err) {
    console.error("Database connection error:", err)
    throw new Error("Failed to connect to database")
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const pool = await getConnection()
    
    // Create users table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT GETDATE(),
        updated_at DATETIME DEFAULT GETDATE()
      )
    `)
    
    console.log("Database initialized successfully")
  } catch (err) {
    console.error("Failed to initialize database:", err)
    throw err
  }
}

export { sql }
