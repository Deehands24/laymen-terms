// Mock data for when database connection fails in production

// Mock users with auto-incrementing ID
let nextUserId = 3
export const mockUsers = [
  { id: 1, username: "demo_user" },
  { id: 2, username: "test_user" },
]

// Mock submissions
export const mockSubmissions = [
  {
    id: 1,
    userId: 1,
    submittedText: "The patient presents with hypertension and hyperlipidemia requiring medication adjustment.",
    submittedAt: new Date("2023-05-14T10:30:00"),
  },
  {
    id: 2,
    userId: 1,
    submittedText: "MRI shows mild degenerative changes in the lumbar spine with no significant stenosis.",
    submittedAt: new Date("2023-05-12T14:45:00"),
  },
  {
    id: 3,
    userId: 1,
    submittedText: "Patient diagnosed with acute rhinosinusitis and prescribed amoxicillin for 10 days.",
    submittedAt: new Date("2023-05-10T09:15:00"),
  },
]

// Mock laymen terms
export const mockLaymenTerms = [
  {
    id: 1,
    submissionId: 1,
    explanation:
      "The patient has high blood pressure and high cholesterol levels that need changes to their medication.",
    returnedAt: new Date("2023-05-14T10:31:00"),
  },
  {
    id: 2,
    submissionId: 2,
    explanation:
      "The MRI scan shows minor age-related wear in the lower back without any serious narrowing of the spinal canal.",
    returnedAt: new Date("2023-05-12T14:46:00"),
  },
  {
    id: 3,
    submissionId: 3,
    explanation: "The patient has a sinus infection and was given the antibiotic amoxicillin to take for 10 days.",
    returnedAt: new Date("2023-05-10T09:16:00"),
  },
]

// Mock user view data
export const mockUserLaymenTermsView = mockSubmissions.map((submission, index) => {
  const laymenTerm = mockLaymenTerms[index]
  const user = mockUsers.find((u) => u.id === submission.userId)!

  return {
    userId: submission.userId,
    username: user.username,
    submissionId: submission.id,
    submittedText: submission.submittedText,
    submittedAt: submission.submittedAt,
    laymenTermId: laymenTerm.id,
    explanation: laymenTerm.explanation,
    returnedAt: laymenTerm.returnedAt,
  }
})

// Mock functions
export function mockGetUserByUsername(username: string) {
  return mockUsers.find((user) => user.username === username) || null
}

export function mockCreateUser(username: string, password: string) {
  const newId = nextUserId++
  mockUsers.push({ id: newId, username })
  return newId
}

export function mockGetUserTranslations(userId: number) {
  return mockUserLaymenTermsView.filter((item) => item.userId === userId)
}

export function mockSubmitMedicalText(userId: number, text: string) {
  const newId = mockSubmissions.length + 1
  mockSubmissions.push({
    id: newId,
    userId,
    submittedText: text,
    submittedAt: new Date(),
  })
  return newId
}

export function mockSaveLaymenTerms(submissionId: number, explanation: string) {
  const newId = mockLaymenTerms.length + 1
  mockLaymenTerms.push({
    id: newId,
    submissionId,
    explanation,
    returnedAt: new Date(),
  })
  return newId
}
