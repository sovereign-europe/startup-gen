import path from "path"

import { generateText } from "ai"
import fs from "fs-extra"
import Mustache from "mustache"

import { problemDescriptionPrompt } from "../prompts/problem-description"
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

export async function problemCommand(onMessage?: (message: string) => void): Promise<string> {
  const messages: string[] = []

  const sendMessage = (message: string) => {
    messages.push(message)
    if (onMessage) {
      onMessage(message)
    }
  }

  try {
    sendMessage("🔍 **Problem Definition Analysis**\n" + "─".repeat(50))

    // Create problems directory if it doesn't exist
    const problemsDir = path.join(process.cwd(), "problems")
    await fs.ensureDir(problemsDir)
    const problemFilePath = path.join(problemsDir, "problem.md")

    let problemDescription: string

    // Check if problem file already exists
    if (await fs.pathExists(problemFilePath)) {
      sendMessage("📄 Found existing problem file. Analyzing current problem definition...")

      try {
        const existingContent = await fs.readFile(problemFilePath, "utf-8")
        problemDescription = extractProblemFromMarkdown(existingContent)

        if (!problemDescription) {
          const errorMessage =
            "⚠️  Could not extract problem description from existing file. Please create a new problem file with a clear problem statement in the '## Original Problem Statement' section."
          sendMessage(errorMessage)
          return messages.join("\n\n")
        } else {
          sendMessage(
            `📋 **Current problem:** ${problemDescription.substring(0, 200)}${problemDescription.length > 200 ? "..." : ""}`,
          )
        }
      } catch (error) {
        const errorMessage = `❌ Error reading existing problem file: ${error instanceof Error ? error.message : "Unknown error"}`
        sendMessage(errorMessage)
        return messages.join("\n\n")
      }
    } else {
      const errorMessage =
        "❌ **No problem file found!**\n\nTo use the problem analysis feature:\n1. First create a file at `problems/problem.md`\n2. Add your problem description in the '## Original Problem Statement' section\n3. Then run `/problem` again to get AI analysis\n\n**Example format:**\n```\n# Problem Definition\n\n## Original Problem Statement\nYour problem description here...\n\n## Analysis Date\n2025-01-26\n\n---\n```"
      sendMessage(errorMessage)
      return messages.join("\n\n")
    }

    sendMessage("🤖 Analyzing your problem definition...")

    // Load and process the analysis prompt
    sendMessage("🔍 Getting AI feedback on your problem definition...")

    // Render the prompt with the problem description
    const analysisPrompt = Mustache.render(problemDescriptionPrompt, {
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

    sendMessage("✅ **Analysis complete!**")
    sendMessage(`📄 Full analysis saved to: ${path.relative(process.cwd(), problemFilePath)}`)
    sendMessage(
      "─".repeat(50) +
        "\n📋 **Next Steps:**\n1. Review the analysis and action items in the generated file\n2. Complete the recommended tasks to validate your problem\n3. Update your problem definition based on your findings",
    )

    return messages.join("\n\n")
  } catch (error) {
    const errorMessage = `❌ Error analyzing problem: ${error instanceof Error ? error.message : "Unknown error"}`
    sendMessage(errorMessage)
    return messages.join("\n\n")
  }
}
