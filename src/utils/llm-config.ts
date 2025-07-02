import { z } from "zod"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { mistral } from "@ai-sdk/mistral"
import { tool } from "ai"
import { createOrUpdateFile } from "../services/tools/createOrUpdateFile"
import { convertMdToPdf } from "../services/tools/mdToPdf"

export function getLLMModel() {
  const provider = process.env.AI_PROVIDER || "openai"

  switch (provider) {
    case "anthropic":
      return anthropic(process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20240229")
    case "mistral":
      return mistral(process.env.MISTRAL_MODEL || "mistral-medium")
    case "openai":
    default:
      return openai(process.env.OPENAI_MODEL || "gpt-3.5-turbo")
  }
}

export const LLM_CONFIG = {
  maxTokens: 500, // Reasonable limit for console output
  temperature: 0.7, // Balanced creativity and consistency
} as const

export const LLM_TOOLS = {
  createOrUpdateFile: tool({
    description: "Create or update a file with the given content",
    parameters: z.object({
      path: z.string().describe("The path of the file to create or update"),
      content: z.string().describe("The content to create or update the file with"),
    }),
    execute: async ({ path: filePath, content }) => {
      await createOrUpdateFile(filePath, content)
    },
  }),
  convertMdToPdf: tool({
    description: "Convert markdown file to PDF",
    parameters: z.object({
      pathToMd: z.string().describe("The path of the markdown file"),
      pathToPdf: z.string().describe("The path of the resulting PDF file"),
    }),
    execute: async ({ pathToMd, pathToPdf }) => {
      await convertMdToPdf(pathToMd, pathToPdf)
    },
  }),
}
