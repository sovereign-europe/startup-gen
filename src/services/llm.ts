import { generateText } from "ai"
import { systemPrompt } from "../prompts/SYSTEM"
import { createContext } from "../utils/createContext"
import { getLLMModel, getLLMConfig, LLM_TOOLS } from "../utils/llm-config"
import { getRecentConversationForModel } from "./conversation-history"
import { getAIConfig } from "./config"
import dotenv from "dotenv"

dotenv.config()

export async function processWithLLM(userInput: string): Promise<string> {
  // Check for API key based on configured provider
  const config = getAIConfig()
  const provider = config.provider
  const apiKeyEnvVar =
    provider === "anthropic" ? "ANTHROPIC_API_KEY" : provider === "mistral" ? "MISTRAL_API_KEY" : "OPENAI_API_KEY"

  if (!process.env[apiKeyEnvVar]) {
    throw new Error(`${provider.toUpperCase()} API key not found. Please run "/model" to configure your AI provider.`)
  }

  const context = await createContext()
  const processedSystemPrompt = systemPrompt.replace("{{context}}", context)

  // Get recent conversation history for context
  const recentHistory = await getRecentConversationForModel()

  // Build messages array with conversation history
  const messages = [
    ...recentHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    {
      role: "user" as const,
      content: userInput,
    },
  ]

  const result = await generateText({
    model: getLLMModel(),
    system: processedSystemPrompt,
    messages,
    ...getLLMConfig(),
    tools: LLM_TOOLS,
  })

  return result.text
}
