import dotenv from "dotenv"

import { getAIConfig } from "./config"

dotenv.config()

export interface ModelValidationResult {
  isValid: boolean
  message: string
  details?: string
}

export function validateModelConfiguration(): ModelValidationResult {
  try {
    // Get AI configuration
    const config = getAIConfig()
    const provider = config.provider

    // Check if provider is valid
    if (!["openai", "anthropic", "mistral"].includes(provider)) {
      return {
        isValid: false,
        message: "Invalid AI provider configured",
        details: `Provider "${provider}" is not supported. Use: openai, anthropic, or mistral`,
      }
    }

    // Check for required API key
    const apiKeyEnvVar = getApiKeyEnvVar(provider)
    const apiKey = process.env[apiKeyEnvVar]

    if (!apiKey) {
      return {
        isValid: false,
        message: "Missing API key",
        details: `${provider.toUpperCase()} API key not found. Run "/model" to configure your AI provider.`,
      }
    }

    // Check if API key format looks valid (basic check)
    if (apiKey.length < 10) {
      return {
        isValid: false,
        message: "Invalid API key format",
        details: `${provider.toUpperCase()} API key appears to be invalid. Run "/model" to reconfigure.`,
      }
    }

    // Check if model is specified
    const model = config.models[provider]
    if (!model) {
      return {
        isValid: false,
        message: "No model specified",
        details: `No model specified for ${provider}. Run "/model" to configure.`,
      }
    }

    // All checks passed
    return {
      isValid: true,
      message: `AI ready`,
    }
  } catch (error) {
    return {
      isValid: false,
      message: "Configuration error",
      details: error instanceof Error ? error.message : "Unknown configuration error",
    }
  }
}

function getApiKeyEnvVar(provider: string): string {
  switch (provider) {
    case "anthropic":
      return "ANTHROPIC_API_KEY"
    case "mistral":
      return "MISTRAL_API_KEY"
    case "openai":
    default:
      return "OPENAI_API_KEY"
  }
}
