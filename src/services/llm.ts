import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { systemPrompt } from "../prompts/SYSTEM"
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

    const result = await generateText({
      model: openai("gpt-3.5-turbo"),
      system: systemPrompt,
      prompt: userInput,
      maxTokens: 500, // Reasonable limit for console output
      temperature: 0.7, // Balanced creativity and consistency
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

export function formatLLMResponse(response: string): string {
  // Format the response for better console display
  const lines = response.split("\n")
  const formattedLines: string[] = []

  for (const line of lines) {
    if (line.trim() === "") {
      formattedLines.push("")
      continue
    }

    // Add proper indentation and wrapping for console
    const trimmedLine = line.trim()
    if (trimmedLine.length <= 70) {
      formattedLines.push(`  ${trimmedLine}`)
    } else {
      // Simple word wrapping for long lines
      const words = trimmedLine.split(" ")
      let currentLine = "  "

      for (const word of words) {
        if (currentLine.length + word.length + 1 <= 70) {
          currentLine += word + " "
        } else {
          formattedLines.push(currentLine.trim())
          currentLine = `  ${word} `
        }
      }

      if (currentLine.trim().length > 2) {
        formattedLines.push(currentLine.trim())
      }
    }
  }

  return formattedLines.join("\n")
}
