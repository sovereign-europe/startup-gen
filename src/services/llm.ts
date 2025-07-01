import { z } from "zod"
import { openai } from "@ai-sdk/openai"
import { generateText, tool } from "ai"
import { systemPrompt } from "../prompts/SYSTEM"
import { createContext } from "../utils/createContext"
import dotenv from "dotenv"
import { updateFile } from "./tools/updateFile"

dotenv.config()

export async function processWithLLM(userInput: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not found. Please run "/init" first to set up your API key.')
  }

  console.log("\n🤖 Processing with AI startup coach...")

  const context = await createContext()
  const processedSystemPrompt = systemPrompt.replace("{{context}}", context)

  const result = await generateText({
    model: openai("gpt-3.5-turbo"),
    system: processedSystemPrompt,
    prompt: userInput,
    maxTokens: 500, // Reasonable limit for console output
    temperature: 0.7, // Balanced creativity and consistency,
    tools: {
      updateFile: tool({
        description: "Update a file with the given content",
        parameters: z.object({
          path: z.string().describe("The path of the file to update"),
          content: z.string().describe("The content to update the file with"),
        }),
        execute: async ({ path: filePath, content }) => {
          await updateFile(filePath, content)
        },
      }),
    },
  })

  return result.text
}
