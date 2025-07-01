import { z } from "zod"
import { openai } from "@ai-sdk/openai"
import { generateText, tool } from "ai"
import { systemPrompt } from "../prompts/SYSTEM"
import { createContext } from "../utils/createContext"
import fs from "fs-extra"
import path from "path"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

export interface LLMResponse {
  success: boolean
  content?: string
  error?: string
}

export async function processWithLLM(userInput: string): Promise<LLMResponse> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OpenAI API key not found. Please run '/init' first to set up your API key.",
      }
    }

    console.log("\n🤖 Processing with AI startup coach...")

    // Create context and replace placeholder in system prompt
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
            try {
              // Validate file path - ensure it's within the project directory
              const resolvedPath = path.resolve(filePath)
              const projectRoot = process.cwd()

              if (!resolvedPath.startsWith(projectRoot)) {
                return {
                  success: false,
                  error: "File path must be within the project directory",
                }
              }

              // Ensure the directory exists
              await fs.ensureDir(path.dirname(resolvedPath))

              // Write the file
              await fs.writeFile(resolvedPath, content, "utf-8")

              return {
                success: true,
                message: `Successfully updated file: ${filePath}`,
              }
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
              }
            }
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
