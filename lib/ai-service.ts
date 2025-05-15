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
    // Use the AI SDK to generate text with Groq
    const { text } = await generateText({
      model: groq(model),
      prompt: `Translate the following medical text into simple language: "${medicalText}"`,
      system: SYSTEM_PROMPT,
      temperature: temperature,
    })

    return text || "No translation available."
  } catch (error) {
    console.error("Error translating medical text:", error)
    throw new Error("Failed to translate medical text")
  }
}

// Function to get available models
export async function getAvailableModels(): Promise<string[]> {
  // For Groq, we'll return the models we know are available
  return ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma-7b-it"]
}
