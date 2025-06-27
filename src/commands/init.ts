import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"

export async function initCommand() {
  try {
    console.log("🚀 Welcome to Startup CLI!")
    console.log("Let's set up your lean startup project...\n")

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "startupName",
        message: "What is your startup name?",
        validate: (input: string) =>
          input.trim().length > 0 || "Startup name cannot be empty",
      },
      {
        type: "password",
        name: "openaiApiKey",
        message: "Enter your OpenAI API key:",
        validate: (input: string) =>
          input.trim().length > 0 || "API key cannot be empty",
      },
    ])

    const { startupName, openaiApiKey } = answers

    await createReadme(startupName)
    await createEnvFile(openaiApiKey)
    await createGitIgnore()
    await initializeGitRepo()
    await commitInitialFiles(startupName)

    console.log("\n✅ Project initialized successfully!")

    const runCustomerSegment = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "Would you like to run the customer-segment command now?",
        default: true,
      },
    ])

    if (runCustomerSegment.proceed) {
      const { generateCustomerSegment } = await import("./customer-segment")
      await generateCustomerSegment()
    }
  } catch (error) {
    console.error("Error during initialization:", error)
    process.exit(1)
  }
}

async function createReadme(startupName: string) {
  const readmeContent = `# ${startupName}

Welcome to ${startupName}! This project was initialized with Startup CLI.

## Getting Started

This is your lean startup project. Use the Startup CLI to build your customer segments, validate your ideas, and iterate quickly.

## Next Steps

1. Define your customer segments with \`startup build customer-segment\`
2. Validate your assumptions
3. Build your MVP
4. Iterate based on feedback

---
*Generated with Startup CLI*
`

  await fs.writeFile("README.md", readmeContent)
  console.log("📝 Created README.md")
}

async function createEnvFile(apiKey: string) {
  const envContent = `OPENAI_API_KEY=${apiKey}\n`
  await fs.writeFile(".env", envContent)
  console.log("🔐 Created .env file")
}

async function createGitIgnore() {
  const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log
`

  await fs.writeFile(".gitignore", gitignoreContent)
  console.log("📋 Created .gitignore")
}

async function initializeGitRepo() {
  try {
    execSync("git init", { stdio: "ignore" })
    console.log("📦 Initialized git repository")
  } catch {
    console.log("⚠️  Git repository already exists or git not available")
  }
}

async function commitInitialFiles(startupName: string) {
  try {
    execSync("git add README.md .gitignore", { stdio: "ignore" })
    execSync(
      `git commit -m "Initial commit: Setup ${startupName} with Startup CLI"`,
      { stdio: "ignore" },
    )
    console.log("💾 Committed initial files")
  } catch {
    console.log("⚠️  Could not commit files (git may not be configured)")
  }
}
