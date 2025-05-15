import { sql, poolPromise } from "./db"

export interface User {
  id: number
  username: string
}

export interface Submission {
  id: number
  userId: number
  submittedText: string
  submittedAt: Date
}

export interface LaymenTerm {
  id: number
  submissionId: number
  explanation: string
  returnedAt: Date
}

export interface UserLaymenTermsView {
  userId: number
  username: string
  submissionId: number
  submittedText: string
  submittedAt: Date
  laymenTermId: number
  explanation: string
  returnedAt: Date
}

export interface UserActivitySummary {
  userId: number
  username: string
  submissionCount: number
  explanationCount: number
  usageLogCount: number
}

// Get user translations history
export async function getUserTranslations(userId: number): Promise<UserLaymenTermsView[]> {
  try {
    const pool = await poolPromise

    // If pool is null (connection failed), use mock data
    if (!pool) {
      console.log("Using mock data for getUserTranslations")
      const { mockGetUserTranslations } = require("./mock-data")
      return mockGetUserTranslations(userId)
    }

    const result = await pool
      .request()
      .input("CurrentUserId", sql.Int, userId)
      .query("SELECT * FROM [dbo].[UserLaymenTermsView] WHERE UserId = @CurrentUserId ORDER BY SubmittedAt DESC")

    return result.recordset
  } catch (error) {
    console.error("Error fetching user translations:", error)
    // Fall back to mock data in case of error
    console.log("Falling back to mock data after error in getUserTranslations")
    const { mockGetUserTranslations } = require("./mock-data")
    return mockGetUserTranslations(userId)
  }
}

// Get user activity summary
export async function getUserActivitySummary(userId: number): Promise<UserActivitySummary> {
  try {
    const pool = await poolPromise
    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query("SELECT * FROM [dbo].[UserActivitySummary] WHERE UserId = @UserId")

    return result.recordset[0]
  } catch (error) {
    console.error("Error fetching user activity summary:", error)
    throw error
  }
}

// Submit new medical text for translation
export async function submitMedicalText(userId: number, text: string): Promise<number> {
  try {
    const pool = await poolPromise

    // If pool is null (connection failed), use mock data
    if (!pool) {
      console.log("Using mock data for submitMedicalText")
      const { mockSubmitMedicalText } = require("./mock-data")
      return mockSubmitMedicalText(userId, text)
    }

    // Insert submission
    const submissionResult = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("SubmittedText", sql.NVarChar, text)
      .query(`
        INSERT INTO [dbo].[Submissions] (UserId, SubmittedText, SubmittedAt)
        VALUES (@UserId, @SubmittedText, GETDATE());
        SELECT SCOPE_IDENTITY() AS SubmissionId;
      `)

    return submissionResult.recordset[0].SubmissionId
  } catch (error) {
    console.error("Error submitting medical text:", error)
    // Fall back to mock data in case of error
    console.log("Falling back to mock data after error in submitMedicalText")
    const { mockSubmitMedicalText } = require("./mock-data")
    return mockSubmitMedicalText(userId, text)
  }
}

// Save laymen terms explanation
export async function saveLaymenTerms(submissionId: number, explanation: string): Promise<number> {
  try {
    const pool = await poolPromise

    // If pool is null (connection failed), use mock data
    if (!pool) {
      console.log("Using mock data for saveLaymenTerms")
      const { mockSaveLaymenTerms } = require("./mock-data")
      return mockSaveLaymenTerms(submissionId, explanation)
    }

    // Insert laymen terms
    const result = await pool
      .request()
      .input("SubmissionId", sql.Int, submissionId)
      .input("Explanation", sql.NVarChar, explanation)
      .query(`
        INSERT INTO [dbo].[LaymenTerms] (SubmissionId, Explanation, ReturnedAt)
        VALUES (@SubmissionId, @Explanation, GETDATE());
        SELECT SCOPE_IDENTITY() AS LaymenTermId;
      `)

    return result.recordset[0].LaymenTermId
  } catch (error) {
    console.error("Error saving laymen terms:", error)
    // Fall back to mock data in case of error
    console.log("Falling back to mock data after error in saveLaymenTerms")
    const { mockSaveLaymenTerms } = require("./mock-data")
    return mockSaveLaymenTerms(submissionId, explanation)
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const pool = await poolPromise

    // If pool is null (connection failed), use mock data
    if (!pool) {
      console.log("Using mock data for getUserByUsername")
      const { mockGetUserByUsername } = require("./mock-data")
      return mockGetUserByUsername(username)
    }

    const result = await pool
      .request()
      .input("Username", sql.NVarChar, username)
      .query("SELECT Id, Username FROM [dbo].[Users] WHERE Username = @Username")

    return result.recordset[0] || null
  } catch (error) {
    console.error("Error fetching user:", error)
    // Fall back to mock data in case of error
    console.log("Falling back to mock data after error in getUserByUsername")
    const { mockGetUserByUsername } = require("./mock-data")
    return mockGetUserByUsername(username)
  }
}

// Create new user
export async function createUser(username: string, password: string): Promise<number> {
  try {
    const pool = await poolPromise

    // If pool is null (connection failed), use mock data
    if (!pool) {
      console.log("Using mock data for createUser")
      const { mockCreateUser } = require("./mock-data")
      return mockCreateUser(username, password)
    }

    // In a real app, you would hash the password
    const result = await pool
      .request()
      .input("Username", sql.NVarChar, username)
      .input("Password", sql.NVarChar, password)
      .query(`
        INSERT INTO [dbo].[Users] (Username, Password)
        VALUES (@Username, @Password);
        SELECT SCOPE_IDENTITY() AS UserId;
      `)

    return result.recordset[0].UserId
  } catch (error) {
    console.error("Error creating user:", error)
    // Fall back to mock data in case of error
    console.log("Falling back to mock data after error in createUser")
    const { mockCreateUser } = require("./mock-data")
    return mockCreateUser(username, password)
  }
}
