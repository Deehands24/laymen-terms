import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// Define the system prompt for medical term translation
const SYSTEM_PROMPT = `
You are an expert in medical terminology with the task of translating complex medical terms and explanations into simple, easy-to-understand language for patients.

Guidelines:
1. Explain medical terms in plain language a 12-year-old could understand
2. Avoid using technical jargon unless absolutely necessary
3. Use analogies and examples where helpful
4. Keep explanations concise but complete
5. Maintain medical accuracy while simplifying
6. Format the response in clear paragraphs
7. If there are action items or important warnings, highlight them clearly
`

export interface TranslationOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export async function translateMedicalText(medicalText: string, options: TranslationOptions = {}): Promise<string> {
  const { model = "llama3-70b-8192", temperature = 0.3 } = options

  try {
    console.log("Starting translation with model:", model)

    // Check if we're in a development/preview environment
    if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview") {
      console.log("Using mock translation in development/preview environment")
      // Return a mock translation for development/preview
      return `This is a simplified version of: "${medicalText}"\n\nMedical terms have been translated to simple language that's easy to understand.`
    }

    // Use the AI SDK to generate text with Groq
    const { text } = await generateText({
      model: groq(model),
      prompt: `Translate the following medical text into simple language: "${medicalText}"`,
      system: SYSTEM_PROMPT,
      temperature: temperature,
    })

    console.log("Translation completed successfully")
    return text || "No translation available."
  } catch (error) {
    console.error("Error translating medical text:", error)

    // Return a fallback response instead of throwing
    return `Unable to translate the medical text at this time. Please try again later.\n\nOriginal text: "${medicalText}"`
  }
}

// Function to get available models
export async function getAvailableModels(): Promise<string[]> {
  // For Groq, we'll return the models we know are available
  return ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma-7b-it"]
}
