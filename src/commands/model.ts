import path from "path"

import chalk from "chalk"
import fs from "fs-extra"
import inquirer from "inquirer"

import { updateConfig, getAIConfig } from "../services/config"

type ModelProvider = "openai" | "anthropic" | "mistral"

interface ProviderConfig {
  name: string
  displayName: string
  apiKeyEnvVar: string
  defaultModel: string
  apiKeyUrl: string
}

const PROVIDERS: Record<ModelProvider, ProviderConfig> = {
  openai: {
    name: "openai",
    displayName: "OpenAI",
    apiKeyEnvVar: "OPENAI_API_KEY",
    defaultModel: "gpt-3.5-turbo",
    apiKeyUrl: "https://platform.openai.com/api-keys",
  },
  anthropic: {
    name: "anthropic",
    displayName: "Anthropic",
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    defaultModel: "claude-sonnet-4-20250514",
    apiKeyUrl: "https://console.anthropic.com/",
  },
  mistral: {
    name: "mistral",
    displayName: "Mistral AI",
    apiKeyEnvVar: "MISTRAL_API_KEY",
    defaultModel: "mistral-medium",
    apiKeyUrl: "https://console.mistral.ai/",
  },
}

export async function modelCommand(): Promise<void> {
  console.log("\n🤖 Model Provider Configuration")
  console.log("─".repeat(50))

  try {
    // Show current configuration
    showCurrentConfiguration()

    // Select provider
    const selectedProvider = await selectProvider()
    const provider = PROVIDERS[selectedProvider]

    // Check if API key exists, prompt if not
    const apiKey = await ensureApiKey(provider)

    // Update startup.config.json file
    await updateConfigFile(provider, selectedProvider)

    // Update .env file with API key only
    await updateEnvFileApiKeyOnly(provider, apiKey)

    console.log(`\n✅ Successfully configured ${provider.displayName} as your AI provider!`)
    console.log(`🔧 Model: ${provider.defaultModel}`)
    console.log(`📁 Configuration saved to startup.config.json`)
    console.log("─".repeat(50))
  } catch (error) {
    console.error("❌ Error configuring model provider:", error instanceof Error ? error.message : "Unknown error")
  }
}

function showCurrentConfiguration(): void {
  try {
    const config = getAIConfig()
    const currentProvider = PROVIDERS[config.provider]

    console.log(`📋 Current provider: ${chalk.green(currentProvider.displayName)}`)
    console.log(`🔧 Model: ${chalk.cyan(config.models[config.provider])}`)
    console.log(`⚙️  Max tokens: ${config.maxTokens}`)
    console.log(`🌡️  Temperature: ${config.temperature}`)
  } catch {
    console.log("📝 No configuration found. Let's set up your AI provider.")
  }
  console.log("")
}

async function selectProvider(): Promise<ModelProvider> {
  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Choose your AI provider:",
      choices: [
        {
          name: `${PROVIDERS.openai.displayName} (GPT-3.5, GPT-4)`,
          value: "openai",
        },
        {
          name: `${PROVIDERS.anthropic.displayName} (Claude)`,
          value: "anthropic",
        },
        {
          name: `${PROVIDERS.mistral.displayName} (Mistral models)`,
          value: "mistral",
        },
      ],
    },
  ])

  return provider as ModelProvider
}

async function ensureApiKey(provider: ProviderConfig): Promise<string> {
  // Check if API key already exists in environment
  if (process.env[provider.apiKeyEnvVar]) {
    const { useExisting } = await inquirer.prompt([
      {
        type: "confirm",
        name: "useExisting",
        message: `Use existing ${provider.displayName} API key?`,
        default: true,
      },
    ])

    if (useExisting) {
      return process.env[provider.apiKeyEnvVar]!
    }
  }

  // Prompt for new API key
  console.log(`\n🔑 ${provider.displayName} API Key Required`)
  console.log(`Get your API key from: ${chalk.blue(provider.apiKeyUrl)}`)
  console.log("")

  const { apiKey } = await inquirer.prompt([
    {
      type: "password",
      name: "apiKey",
      message: `Enter your ${provider.displayName} API key:`,
      validate: (input: string) => {
        if (!input.trim()) {
          return "API key cannot be empty"
        }
        return true
      },
    },
  ])

  return apiKey.trim()
}

async function updateConfigFile(provider: ProviderConfig, selectedProvider: ModelProvider): Promise<void> {
  const currentConfig = getAIConfig()
  updateConfig({
    ai: {
      ...currentConfig,
      provider: selectedProvider,
      models: {
        ...currentConfig.models,
        [selectedProvider]: provider.defaultModel,
      },
    },
  })
}

async function updateEnvFileApiKeyOnly(provider: ProviderConfig, apiKey: string): Promise<void> {
  const envPath = path.join(process.cwd(), ".env")
  let envContent = ""

  // Read existing .env file if it exists
  if (await fs.pathExists(envPath)) {
    envContent = await fs.readFile(envPath, "utf-8")
  }

  // Remove existing API key configurations (but keep other env vars)
  const linesToRemove = ["OPENAI_API_KEY=", "ANTHROPIC_API_KEY=", "MISTRAL_API_KEY="]

  envContent = envContent
    .split("\n")
    .filter((line) => !linesToRemove.some((prefix) => line.startsWith(prefix)))
    .join("\n")

  // Add new API key
  const newConfig = `${provider.apiKeyEnvVar}=${apiKey}`

  // Ensure we don't have trailing newlines before adding new content
  envContent = envContent.trim()
  if (envContent) {
    envContent += "\n"
  }
  envContent += newConfig + "\n"

  // Write updated .env file
  await fs.writeFile(envPath, envContent)
}
