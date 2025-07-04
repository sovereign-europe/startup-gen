import * as fs from "fs"
import * as path from "path"

export interface StartupConfig {
  ai: {
    provider: "openai" | "anthropic" | "mistral"
    models: {
      openai: string
      anthropic: string
      mistral: string
    }
    maxTokens: number
    temperature: number
  }
}

const DEFAULT_CONFIG: StartupConfig = {
  ai: {
    provider: "openai",
    models: {
      openai: "gpt-3.5-turbo",
      anthropic: "claude-3-sonnet-20240229",
      mistral: "mistral-medium",
    },
    maxTokens: 500,
    temperature: 0.7,
  },
}

let cachedConfig: StartupConfig | null = null

export function loadConfig(): StartupConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  const configPath = path.join(process.cwd(), "startup.config.json")

  try {
    if (fs.existsSync(configPath)) {
      const configFile = fs.readFileSync(configPath, "utf8")
      const userConfig = JSON.parse(configFile)

      // Merge with default config to ensure all properties exist
      cachedConfig = {
        ai: {
          ...DEFAULT_CONFIG.ai,
          ...userConfig.ai,
          models: {
            ...DEFAULT_CONFIG.ai.models,
            ...userConfig.ai?.models,
          },
        },
      }
    } else {
      // Create default config file if it doesn't exist
      fs.writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2))
      cachedConfig = DEFAULT_CONFIG
    }
  } catch (error) {
    console.warn("Failed to load startup.config.json, using defaults:", error)
    cachedConfig = DEFAULT_CONFIG
  }

  return cachedConfig
}

export function updateConfig(config: Partial<StartupConfig>): void {
  const currentConfig = loadConfig()
  const newConfig = {
    ...currentConfig,
    ...config,
    ai: {
      ...currentConfig.ai,
      ...config.ai,
      models: {
        ...currentConfig.ai.models,
        ...config.ai?.models,
      },
    },
  }

  const configPath = path.join(process.cwd(), "startup.config.json")
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2))
  cachedConfig = newConfig
}

export function getAIConfig() {
  return loadConfig().ai
}
