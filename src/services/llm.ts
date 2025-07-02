import { generateText } from "ai"
import { systemPrompt } from "../prompts/SYSTEM"
import { createContext } from "../utils/createContext"
import { LLM_MODEL, LLM_CONFIG, LLM_TOOLS } from "../utils/llm-config"
import dotenv from "dotenv"

dotenv.config()

export async function processWithLLM(userInput: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please run "/init" first to set up your API key.')
  }

  console.log("\n🤖 Processing with AI startup coach...")

  const context = await createContext()
  const processedSystemPrompt = systemPrompt.replace("{{context}}", context)

  const result = await generateText({
    model: LLM_MODEL,
    system: processedSystemPrompt,
    prompt: userInput,
    ...LLM_CONFIG,
    tools: LLM_TOOLS,
  })

  return result.text
}
