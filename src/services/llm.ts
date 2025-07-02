import { generateText } from "ai"
import { systemPrompt } from "../prompts/SYSTEM"
import { createContext } from "../utils/createContext"
import { getLLMModel, LLM_CONFIG, LLM_TOOLS } from "../utils/llm-config"
import { getRecentConversationForModel } from "./conversation-history"
import dotenv from "dotenv"

dotenv.config()

export async function processWithLLM(userInput: string): Promise<string> {
  // Check for API key based on configured provider
  const provider = process.env.AI_PROVIDER || "openai"
  const apiKeyEnvVar =
    provider === "anthropic" ? "ANTHROPIC_API_KEY" : provider === "mistral" ? "MISTRAL_API_KEY" : "OPENAI_API_KEY"

  if (!process.env[apiKeyEnvVar]) {
    throw new Error(`${provider.toUpperCase()} API key not found. Please run "/model" to configure your AI provider.`)
  }

  console.log("\n🤖 Processing with AI startup coach...")

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
    ...LLM_CONFIG,
    tools: LLM_TOOLS,
  })

  return result.text
}
