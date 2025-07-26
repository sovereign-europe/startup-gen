import path from "path"

import { generateText } from "ai"
import fs from "fs-extra"
import inquirer from "inquirer"
import Mustache from "mustache"

import { getLLMModel, getLLMConfig } from "../utils/llm-config"

// Helper function to extract problem description from existing markdown file
function extractProblemFromMarkdown(content: string): string {
  const lines = content.split("\n")
  let inProblemSection = false
  const problemLines: string[] = []

  for (const line of lines) {
    if (line.includes("## Original Problem Statement")) {
      inProblemSection = true
      continue
    }

    if (inProblemSection) {
      if (line.startsWith("##") || line.startsWith("---")) {
        break
      }
      if (line.trim()) {
        problemLines.push(line)
      }
    }
  }

  return problemLines.join("\n").trim()
}

export async function problemCommand(): Promise<void> {
  try {
    console.log("\n🔍 Problem Definition Analysis")
    console.log("─".repeat(50))

    // Create problems directory if it doesn't exist
    const problemsDir = path.join(process.cwd(), "problems")
    await fs.ensureDir(problemsDir)
    const problemFilePath = path.join(problemsDir, "problem.md")

    let problemDescription: string

    // Check if problem file already exists
    if (await fs.pathExists(problemFilePath)) {
      console.log("📄 Found existing problem file. Analyzing current problem definition...")
      console.log("")

      try {
        const existingContent = await fs.readFile(problemFilePath, "utf-8")
        problemDescription = extractProblemFromMarkdown(existingContent)

        if (!problemDescription) {
          console.log("⚠️  Could not extract problem description from existing file.")
          console.log("📝 Please provide your problem description:")
          const { newProblemDescription } = await inquirer.prompt([
            {
              type: "input",
              name: "newProblemDescription",
              message: "What is the problem you're solving?",
              validate: (input: string) => {
                if (!input.trim()) {
                  return "Problem description cannot be empty"
                }
                if (input.trim().length < 10) {
                  return "Please provide a more detailed problem description (at least 10 characters)"
                }
                return true
              },
            },
          ])
          problemDescription = newProblemDescription
        } else {
          console.log(
            `📋 Current problem: ${problemDescription.substring(0, 100)}${problemDescription.length > 100 ? "..." : ""}`,
          )
        }
      } catch (error) {
        console.error("❌ Error reading existing problem file:", error)
        return
      }
    } else {
      console.log("Let's analyze your problem definition and get actionable feedback.")
      console.log("")

      // Ask user for their problem definition
      const { newProblemDescription } = await inquirer.prompt([
        {
          type: "input",
          name: "newProblemDescription",
          message: "What is the problem you're solving?",
          validate: (input: string) => {
            if (!input.trim()) {
              return "Problem description cannot be empty"
            }
            if (input.trim().length < 10) {
              return "Please provide a more detailed problem description (at least 10 characters)"
            }
            return true
          },
        },
      ])

      problemDescription = newProblemDescription

      // Save the problem description to file
      const initialContent = `# Problem Definition

## Original Problem Statement
${problemDescription}

## Analysis Date
${new Date().toISOString().split("T")[0]}

---

`

      await fs.writeFile(problemFilePath, initialContent)
      console.log(`📄 Problem saved to: ${path.relative(process.cwd(), problemFilePath)}`)
    }

    console.log("🤖 Analyzing your problem definition...")

    // Load and process the analysis prompt
    console.log("🔍 Getting AI feedback on your problem definition...")
    const promptPath = path.join(process.cwd(), "prompts", "problem-description.md")

    let promptTemplate: string
    try {
      promptTemplate = await fs.readFile(promptPath, "utf-8")
    } catch {
      console.error("❌ Error: Could not find problem analysis prompt at prompts/problem-description.md")
      console.log("💡 Make sure the prompts directory exists and contains the problem-description.md file")
      return
    }

    // Render the prompt with the problem description
    const analysisPrompt = Mustache.render(promptTemplate, {
      problemDescription: problemDescription.trim(),
    })

    // Get AI analysis
    const result = await generateText({
      model: getLLMModel(),
      prompt: analysisPrompt,
      ...getLLMConfig(),
    })

    const aiAnalysis = result.text

    // Append the AI analysis to the problem file
    const analysisSection = `
## AI Analysis and Feedback

${aiAnalysis}

---

*Analysis generated on ${new Date().toLocaleString()}*
`

    await fs.appendFile(problemFilePath, analysisSection)

    console.log("✅ Analysis complete!")
    console.log(`📄 Full analysis saved to: ${path.relative(process.cwd(), problemFilePath)}`)
    console.log("─".repeat(50))
    console.log("📋 Next Steps:")
    console.log("1. Review the analysis and action items in the generated file")
    console.log("2. Complete the recommended tasks to validate your problem")
    console.log("3. Update your problem definition based on your findings")
    console.log("")
  } catch (error) {
    console.error("❌ Error analyzing problem:", error instanceof Error ? error.message : "Unknown error")
    throw error
  }
}
