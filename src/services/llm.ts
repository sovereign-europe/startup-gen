import { z } from "zod"
import { openai } from "@ai-sdk/openai"
import { generateText, tool } from "ai"
import { systemPrompt } from "../prompts/SYSTEM"
import { createContext } from "../utils/createContext"
import dotenv from "dotenv"
import { updateFile } from "./tools/updateFile"

dotenv.config()

export interface LLMResponse {
  success: boolean
  content?: string
  error?: string
}

export async function processWithLLM(userInput: string): Promise<LLMResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not found. Please run '/init' first to set up your API key.",
      }
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

    return {
      success: true,
      content: result.text,
    }
  } catch (error) {
    console.error("LLM Error:", error)

    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes("API key")) {
        return {
          success: false,
          error: "Invalid OpenAI API key. Please check your API key in the .env file.",
        }
      }

      if (error.message.includes("quota")) {
        return {
          success: false,
          error: "OpenAI API quota exceeded. Please check your OpenAI account.",
        }
      }

      return {
        success: false,
        error: `AI processing failed: ${error.message}`,
      }
    }

    return {
      success: false,
      error: "Unknown error occurred while processing with AI",
    }
  }
}
