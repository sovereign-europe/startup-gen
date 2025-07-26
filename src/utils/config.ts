import fs from "fs-extra"

export interface StartupConfig {
  autoCommit: boolean
  version: string
}

const CONFIG_FILE_NAME = "startup.config.json"

export const DEFAULT_CONFIG: StartupConfig = {
  autoCommit: false,
  version: "1.0.0",
}

export async function createConfig(config: Partial<StartupConfig> = {}): Promise<void> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  await fs.writeJSON(CONFIG_FILE_NAME, fullConfig, { spaces: 2 })
}

export async function loadConfig(): Promise<StartupConfig> {
  try {
    if (await fs.pathExists(CONFIG_FILE_NAME)) {
      const config = await fs.readJSON(CONFIG_FILE_NAME)
      return { ...DEFAULT_CONFIG, ...config }
    }
    return DEFAULT_CONFIG
  } catch {
    console.warn("⚠️  Could not load config file, using defaults")
    return DEFAULT_CONFIG
  }
}

export async function updateConfig(updates: Partial<StartupConfig>): Promise<void> {
  const currentConfig = await loadConfig()
  const newConfig = { ...currentConfig, ...updates }
  await fs.writeJSON(CONFIG_FILE_NAME, newConfig, { spaces: 2 })
}
