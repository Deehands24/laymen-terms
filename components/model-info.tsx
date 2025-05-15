import { Card } from "@/components/ui/card"

interface ModelInfoProps {
  modelId: string
}

interface ModelDetails {
  name: string
  description: string
  strengths: string[]
  bestFor: string[]
}

const modelDetails: Record<string, ModelDetails> = {
  "llama3-70b-8192": {
    name: "Llama 3 70B",
    description:
      "Meta's most advanced open model with 70 billion parameters, offering high-quality responses for complex medical explanations.",
    strengths: ["Comprehensive knowledge", "Nuanced explanations", "Detailed responses"],
    bestFor: ["Complex medical terminology", "Detailed explanations", "Professional use cases"],
  },
  "llama3-8b-8192": {
    name: "Llama 3 8B",
    description: "A smaller, faster version of Llama 3 with 8 billion parameters, good for simpler explanations.",
    strengths: ["Fast responses", "Good for basic explanations", "Efficient processing"],
    bestFor: ["Basic medical terms", "Quick translations", "Mobile usage"],
  },
  "mixtral-8x7b-32768": {
    name: "Mixtral 8x7B",
    description: "A mixture-of-experts model with excellent reasoning capabilities and a large context window.",
    strengths: ["Strong reasoning", "Large context window", "Balanced performance"],
    bestFor: ["Long medical documents", "Contextual understanding", "Balanced performance needs"],
  },
  "gemma-7b-it": {
    name: "Gemma 7B",
    description: "Google's lightweight, instruction-tuned model optimized for helpful and safe responses.",
    strengths: ["Instruction following", "Balanced responses", "Efficient processing"],
    bestFor: ["General medical explanations", "Straightforward translations", "Everyday use"],
  },
}

export function ModelInfo({ modelId }: ModelInfoProps) {
  const model = modelDetails[modelId] || {
    name: modelId,
    description: "Information about this model is not available.",
    strengths: [],
    bestFor: [],
  }

  return (
    <Card className="p-4 backdrop-blur-sm bg-white/30 border border-gray-100">
      <h3 className="text-lg font-medium mb-2">{model.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{model.description}</p>

      {model.strengths.length > 0 && (
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Strengths:</h4>
          <ul className="text-xs text-gray-600 pl-5 list-disc">
            {model.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {model.bestFor.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-1">Best for:</h4>
          <ul className="text-xs text-gray-600 pl-5 list-disc">
            {model.bestFor.map((use, index) => (
              <li key={index}>{use}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
