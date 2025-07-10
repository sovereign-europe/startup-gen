import { execSync } from "child_process"

import fs from "fs-extra"
import inquirer from "inquirer"

import { createConfig } from "../utils/config"

import { createGitIgnore } from "./init/createGitIgnore"
import { createReadme } from "./init/createReadme"

export async function initCommand() {
  try {
    console.log("🚀 Welcome to Startup CLI!")
    console.log("Let's set up your lean startup project...\n")

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "startupName",
        message: "What is your startup name?",
        validate: (input: string) => input.trim().length > 0 || "Startup name cannot be empty",
      },
      {
        type: "password",
        name: "openaiApiKey",
        message: "Enter your OpenAI API key:",
        validate: (input: string) => input.trim().length > 0 || "API key cannot be empty",
      },
      {
        type: "confirm",
        name: "autoCommit",
        message: "Enable auto-commit? (automatically commit generated files to git)",
        default: false,
      },
    ])

    const { startupName, openaiApiKey, autoCommit } = answers

    await createReadme(startupName)
    await createEnvFile(openaiApiKey)
    await createGitIgnore()
    await createConfig({ autoCommit })
    await initializeGitRepo()
    await commitInitialFiles(startupName, autoCommit)

    console.log("\n✅ Project initialized successfully!")
    console.log(`⚙️  Auto-commit is ${autoCommit ? "enabled" : "disabled"} (can be changed in startup.config.json)`)
  } catch (error) {
    console.error("Error during initialization:", error)
    process.exit(1)
  }
}

async function createEnvFile(apiKey: string) {
  const envContent = `OPENAI_API_KEY=${apiKey}\n`
  await fs.writeFile(".env", envContent)
  console.log("🔐 Created .env file")
}

async function initializeGitRepo() {
  try {
    execSync("git init", { stdio: "ignore" })
    console.log("📦 Initialized git repository")
  } catch {
    console.log("⚠️  Git repository already exists or git not available")
  }
}

async function commitInitialFiles(startupName: string, autoCommit: boolean) {
  if (!autoCommit) {
    console.log("💡 Auto-commit is disabled. Files created but not committed to git.")
    return
  }

  try {
    execSync("git add README.md .gitignore startup.config.json", { stdio: "ignore" })
    execSync(`git commit -m "Initial commit: Setup ${startupName} with Startup CLI"`, { stdio: "ignore" })
    console.log("💾 Committed initial files")
  } catch {
    console.log("⚠️  Could not commit files (git may not be configured)")
  }
}
