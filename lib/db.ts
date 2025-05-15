import sql from "mssql"

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === "production"

// Use environment variables if available, otherwise fall back to hardcoded values
const config = {
  server: process.env.DB_SERVER || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "1433"),
  database: process.env.DB_NAME || "MedicalTermsDB",
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "StrongPassword123",
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
}

console.log("Database config (without password):", {
  ...config,
  password: "******", // Don't log the actual password
})

// Create a connection pool
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log("Connected to SQL Server")
    return pool
  })
  .catch((err) => {
    console.error("Database Connection Failed: ", err)

    // In production, we'll return null which will be handled by the data access layer
    // In development, we'll throw the error to make debugging easier
    if (isProduction) {
      console.log("Using mock data in production due to database connection failure")
      return null
    } else {
      throw err
    }
  })

export { sql, poolPromise }
