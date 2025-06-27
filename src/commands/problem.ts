import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as dotenv from "dotenv"
import { join } from "path"
import Mustache from "mustache"

export async function generateProblemAnalysis() {
  dotenv.config()

  try {
    if (!(await fs.pathExists(".env"))) {
      throw new Error('No .env file found. Please run "startup init" first to set up your project.')
    }

    console.log("🔍 Let's identify the top 3 problems your startup needs to solve!")
    console.log("We'll analyze the most critical problems and prioritize them for your solution.\n")
    console.log("Let's take a look into the customer persona.\n")

    let customerSegments: string[] = []

    //find customer persona
    try {
      customerSegments = await fs.readdir("./1_segments")
      console.log("customerSegments", customerSegments)
    } catch (error) {
      console.log("error", error)
      console.error("❌ Folder 1_segments not found. Did you run the customer-segment command?")
      process.exit(1)
    }

    //find the file that contains the customer persona
    const customerPersona = customerSegments.find((file) => file.endsWith(".md"))
    console.log("customerPersona", customerPersona)

    //read all persona files
    let personas: string = ""
    for (const persona of customerSegments) {
      const personaContent = await fs.readFile(`./1_segments/${persona}`, "utf8")
      console.log("personaContent", personaContent)
      personas += personaContent
    }

    console.log("personas", personas)

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "initialProblems",
        message: "What problems do you think your customers face? (comma-separated):",
        validate: (input: string) => input.trim().length > 0 || "Please list some problems",
      },
      {
        type: "input",
        name: "additionalContext",
        message: "Any additional context about the market or customer pain points? (optional):",
        default: "",
      },
    ])

    const { initialProblems, additionalContext } = answers

    console.log("\n🤖 Analyzing and prioritizing problems...")

    const problemAnalysis = await generateProblemAnalysisContent(personas, initialProblems, additionalContext)

    const fileName = `2_problems/problem-analysis-${Date.now()}.md`

    await fs.ensureDir("2_problems")
    await fs.writeFile(fileName, problemAnalysis)
    console.log(`📄 Created ${fileName}`)

    await commitProblemFile(fileName)

    console.log("\n✅ Problem analysis created successfully!")
    console.log(`📖 Check out ${fileName} for your prioritized problem breakdown.`)
  } catch (error) {
    console.error("Error creating problem analysis:", error)
    process.exit(1)
  }
}

async function generateProblemAnalysisContent(
  personas: string,
  initialProblems: string,
  additionalContext: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please run "startup init" first.')
  }

  const promptTemplate = await fs.readFile(join(process.cwd(), "prompts", "problem-analysis.txt"), "utf-8")

  const prompt = Mustache.render(promptTemplate, {
    personas,
    initialProblems,
    additionalContext,
  })

  const { text } = await generateText({
    model: openai("gpt-3.5-turbo"),
    prompt,
    maxTokens: 1500,
    temperature: 0.7,
  })

  return text || "Error generating problem analysis"
}

async function commitProblemFile(fileName: string) {
  try {
    execSync(`git add ${fileName}`, { stdio: "ignore" })

    const commitMessage = `Add problem analysis`

    execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" })
    console.log("💾 Committed problem analysis file")
  } catch {
    console.log("⚠️  Could not commit file (git may not be configured)")
  }
}
