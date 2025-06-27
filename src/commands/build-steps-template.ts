import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as dotenv from "dotenv"
import { join } from "path"
import Mustache from "mustache"

// Template for creating new build steps
export async function generateMarketAnalysis() {
  dotenv.config()

  try {
    if (!(await fs.pathExists(".env"))) {
      throw new Error('No .env file found. Please run "startup init" first to set up your project.')
    }

    console.log("📊 Let's analyze your market opportunity!")
    console.log("We'll create a comprehensive market analysis to guide your strategy.\n")

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "productDescription",
        message: "Describe your product or service:",
        validate: (input: string) => input.trim().length > 0 || "Please provide a product description",
      },
      {
        type: "input",
        name: "targetMarket",
        message: "What market or industry are you targeting?",
        validate: (input: string) => input.trim().length > 0 || "Please specify your target market",
      },
      {
        type: "input",
        name: "additionalContext",
        message: "Any additional context about your market? (optional):",
        default: "",
      },
    ])

    const { productDescription, targetMarket, additionalContext } = answers

    console.log("\n🤖 Generating market analysis...")

    // TODO: Implement market analysis generation
    const analysis = await generateAnalysis(productDescription, targetMarket, additionalContext)

    const fileName = `market-analysis-${Date.now()}.md`

    await fs.writeFile(fileName, analysis)
    console.log(`📄 Created ${fileName}`)

    await commitAnalysisFile(fileName, productDescription, targetMarket)

    console.log("\n✅ Market analysis created successfully!")
    console.log(`📖 Check out ${fileName} for your detailed analysis.`)
  } catch (error) {
    console.error("Error creating market analysis:", error)
    process.exit(1)
  }
}

async function generateAnalysis(
  productDescription: string,
  targetMarket: string,
  additionalContext: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please run "startup init" first.')
  }

  const promptTemplate = await fs.readFile(join(process.cwd(), "prompts", "market-analysis.txt"), "utf-8")

  const prompt = Mustache.render(promptTemplate, {
    productDescription,
    targetMarket,
    additionalContext,
  })

  const { text } = await generateText({
    model: openai("gpt-3.5-turbo"),
    prompt,
    maxTokens: 1500,
    temperature: 0.7,
  })

  return text || "Error generating analysis"
}

async function commitAnalysisFile(fileName: string, productDescription: string, targetMarket: string) {
  try {
    execSync(`git add ${fileName}`, { stdio: "ignore" })

    const commitMessage = `Add market analysis: ${productDescription} - ${targetMarket}`

    execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" })
    console.log("💾 Committed market analysis file")
  } catch {
    console.log("⚠️  Could not commit file (git may not be configured)")
  }
}

// Template for other build steps:
// export async function generateValueProposition() { ... }
// export async function generateBusinessModel() { ... }
// export async function generateGoToMarketStrategy() { ... }
