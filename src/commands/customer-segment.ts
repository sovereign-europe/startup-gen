import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as dotenv from "dotenv"
import { customerPersonaPrompt, problemInterviewPrompt } from "../prompts"
import { shouldAutoCommit } from "../utils/config"
import Mustache from "mustache"
import { FOLDER_NAME_SEGMENTS } from "../config"

export async function generateCustomerSegment() {
  dotenv.config()

  try {
    if (!(await fs.pathExists(".env"))) {
      throw new Error('No .env file found. Please run "startup init" first to set up your project.')
    }

    console.log("🎯 Let's build your customer segment!")
    console.log("We'll create a detailed persona to help guide your startup decisions.\n")

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "highLevelDefinition",
        message: "Provide a high-level definition of your target customer:",
        validate: (input: string) => input.trim().length > 0 || "Please provide a customer definition",
      },
      {
        type: "input",
        name: "additionalRefinement",
        message: "Any additional refinements or specific details? (optional):",
        default: "",
      },
    ])

    const { highLevelDefinition, additionalRefinement } = answers

    console.log("\n🤖 Generating detailed customer persona...")

    const persona = await generatePersona(highLevelDefinition, additionalRefinement)
    const personaName = extractPersonaName(persona)

    await fs.ensureDir(FOLDER_NAME_SEGMENTS)
    const fileName = `${FOLDER_NAME_SEGMENTS}/customer-segment-${personaName.toLowerCase().replace(/\s+/g, "-")}.md`

    await fs.writeFile(fileName, persona)
    console.log(`📄 Created ${fileName}`)

    await commitPersonaFile(fileName, highLevelDefinition, additionalRefinement)

    console.log("\n✅ Customer segment created successfully!")
    console.log(`📖 Check out ${fileName} for your detailed persona.`)

    const generateInterview = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "Would you like to generate a problem interview script to validate this persona?",
        default: true,
      },
    ])

    if (generateInterview.proceed) {
      await generateProblemInterview(persona, highLevelDefinition, additionalRefinement, personaName)
    }

    const runProblemAnalysis = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "Would you like to run the problem-analysis command now?",
        default: true,
      },
    ])

    if (runProblemAnalysis.proceed) {
      const { generateProblemAnalysis } = await import("./problem")
      await generateProblemAnalysis()
    }
  } catch (error) {
    console.error("Error creating customer segment:", error)
    process.exit(1)
  }
}

async function generatePersona(highLevelDefinition: string, additionalRefinement: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please run "startup init" first.')
  }

  const prompt = Mustache.render(customerPersonaPrompt, {
    highLevelDefinition,
    additionalRefinement: additionalRefinement
      ? `**Additional nuance or product context:** ${additionalRefinement}`
      : "",
  })

  const { text } = await generateText({
    model: openai("gpt-3.5-turbo"),
    prompt,
    maxTokens: 1500,
    temperature: 0.7,
  })

  return text || "Error generating persona"
}

async function generateProblemInterview(
  personaContent: string,
  highLevelDefinition: string,
  additionalRefinement: string,
  personaName: string,
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please run "startup init" first.')
  }

  console.log("\n🎙️ Generating problem interview script...")

  const prompt = problemInterviewPrompt
    .replace("{{personaContent}}", personaContent)
    .replace("{{highLevelDefinition}}", highLevelDefinition)
    .replace(
      "{{additionalRefinement}}",
      additionalRefinement ? `**Additional nuance or product context:** ${additionalRefinement}` : "",
    )

  const { text } = await generateText({
    model: openai("gpt-3.5-turbo"),
    prompt,
    maxTokens: 2000,
    temperature: 0.7,
  })

  const interviewScript = text || "Error generating interview script"

  const fileName = `${FOLDER_NAME_SEGMENTS}/problem-interview-${personaName.toLowerCase().replace(/\s+/g, "-")}.md`

  await fs.writeFile(fileName, interviewScript)
  console.log(`📄 Created ${fileName}`)

  await commitInterviewFile(fileName, personaName)
  console.log("✅ Problem interview script created successfully!")
  console.log(`📖 Use ${fileName} to validate your persona's pain points with real customers.`)
}

async function commitInterviewFile(fileName: string, personaName: string) {
  if (!(await shouldAutoCommit())) {
    return
  }

  try {
    execSync(`git add ${fileName}`, { stdio: "ignore" })
    const commitMessage = `Add problem interview script for ${personaName}`
    execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" })
    console.log("💾 Committed problem interview script")
  } catch {
    console.log("⚠️  Could not commit file (git may not be configured)")
  }
}

function extractPersonaName(persona: string): string {
  const nameMatch = persona.match(/(?:Name|Persona Name|Meet)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i)
  if (nameMatch) {
    return nameMatch[1]
  }

  const firstLineMatch = persona.split("\n")[0].match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/)
  if (firstLineMatch) {
    return firstLineMatch[1]
  }

  return "Customer-Persona"
}

async function commitPersonaFile(fileName: string, highLevelDefinition: string, additionalRefinement: string) {
  if (!(await shouldAutoCommit())) {
    console.log("💡 Auto-commit is disabled. Enable it in startup.config.json to auto-commit files.")
    return
  }

  try {
    execSync(`git add ${fileName}`, { stdio: "ignore" })

    const commitMessage = additionalRefinement
      ? `Add customer segment: ${highLevelDefinition} - ${additionalRefinement}`
      : `Add customer segment: ${highLevelDefinition}`

    execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" })
    console.log("💾 Committed customer segment file")
  } catch {
    console.log("⚠️  Could not commit file (git may not be configured)")
  }
}
