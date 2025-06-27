import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import * as dotenv from "dotenv"

export async function generateProblemAnalysis() {
  dotenv.config()

  try {
    if (!(await fs.pathExists(".env"))) {
      throw new Error(
        'No .env file found. Please run "startup init" first to set up your project.',
      )
    }

    console.log(
      "🔍 Let's identify the top 3 problems your startup needs to solve!",
    )
    console.log(
      "We'll analyze the most critical problems and prioritize them for your solution.\n",
    )
    console.log("Let's take a look into the customer persona.\n")

    let customerSegments: string[] = []

    //find customer persona
    try {
      customerSegments = await fs.readdir("./1_segments")
      console.log("customerSegments", customerSegments)
    } catch (error) {
      console.log("error", error)
      console.error(
        "❌ Folder 1_segments not found. Did you run the customer-segment command?",
      )
      process.exit(1)
    }

    //find the file that contains the customer persona
    const customerPersona = customerSegments.find((file) =>
      file.endsWith(".md"),
    )
    console.log("customerPersona", customerPersona)

    //read all persona files
    let personas: string = ""
    for (const persona of customerSegments) {
      const personaContent = await fs.readFile(
        `./1_segments/${persona}`,
        "utf8",
      )
      console.log("personaContent", personaContent)
      personas += personaContent
    }

    console.log("personas", personas)

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "initialProblems",
        message:
          "What problems do you think your customers face? (comma-separated):",
        validate: (input: string) =>
          input.trim().length > 0 || "Please list some problems",
      },
      {
        type: "input",
        name: "additionalContext",
        message:
          "Any additional context about the market or customer pain points? (optional):",
        default: "",
      },
    ])

    const { initialProblems, additionalContext } = answers

    console.log("\n🤖 Analyzing and prioritizing problems...")

    const problemAnalysis = await generateProblemAnalysisContent(
      personas,
      initialProblems,
      additionalContext,
    )

    const fileName = `2_problems/problem-analysis-${Date.now()}.md`

    await fs.ensureDir("2_problems")
    await fs.writeFile(fileName, problemAnalysis)
    console.log(`📄 Created ${fileName}`)

    await commitProblemFile(fileName)

    console.log("\n✅ Problem analysis created successfully!")
    console.log(
      `📖 Check out ${fileName} for your prioritized problem breakdown.`,
    )
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
    throw new Error(
      'OpenAI API key not found. Please run "startup init" first.',
    )
  }

  const prompt = `Create a comprehensive problem analysis for a startup, identifying and prioritizing the top 3 problems that need to be solved. Based on the following context:

**Personas:** ${personas}
**Initial Problems Identified:** ${initialProblems}
${additionalContext ? `**Additional Context:** ${additionalContext}` : ""}

### The analysis must include the following sections:

1. **Problem Overview**: A brief summary of the problem space and why it matters
2. **Top 3 Problems (Prioritized)**:
   - **Problem #1**: [Most Critical Problem]
     - Description and impact
     - Why it's the highest priority
     - Evidence of the problem's severity
   - **Problem #2**: [Second Most Critical Problem]
     - Description and impact
     - Why it's the second priority
     - Evidence of the problem's severity
   - **Problem #3**: [Third Most Critical Problem]
     - Description and impact
     - Why it's the third priority
     - Evidence of the problem's severity

3. **Problem Validation**: How to validate these problems with real customers
4. **Problem-Solution Fit**: How your product addresses each problem
5. **Competitive Analysis**: How existing solutions fail to solve these problems
6. **Market Opportunity**: The size and urgency of solving these problems
7. **Next Steps**: Recommended actions to validate and prioritize these problems

### Requirements:
- Focus on problems that are painful, frequent, and urgent
- Include specific examples and evidence where possible
- Prioritize based on customer impact and business opportunity
- Format as a clean, structured Markdown document
- Make each problem actionable and measurable
- Consider both emotional and practical aspects of each problem`

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
