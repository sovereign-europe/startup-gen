import { anthropic } from "@ai-sdk/anthropic"
import { mistral } from "@ai-sdk/mistral"
import { openai } from "@ai-sdk/openai"
import { tool } from "ai"
import { z } from "zod"

import { getAIConfig } from "../services/config"
import { createOrUpdateFile } from "../services/tools/createOrUpdateFile"
import { convertMdToPdf } from "../services/tools/mdToPdf"

export function getLLMModel() {
  const config = getAIConfig()
  const provider = config.provider

  switch (provider) {
    case "anthropic":
      return anthropic(config.models.anthropic)
    case "mistral":
      return mistral(config.models.mistral)
    case "openai":
    default:
      return openai(config.models.openai)
  }
}

export function getLLMConfig() {
  const config = getAIConfig()
  return {
    maxTokens: config.maxTokens,
    temperature: config.temperature,
  }
}

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
