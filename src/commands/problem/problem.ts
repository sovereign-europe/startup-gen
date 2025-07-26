import path from "path"

import { generateText } from "ai"
import fs from "fs-extra"
import Mustache from "mustache"

import { problemDescriptionPrompt } from "../../prompts/problem-description"
import { getLLMModel, getLLMConfig } from "../../utils/llm-config"

import { extractProblemFromMarkdown } from "./extractProblemFromMarkdown"

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

    // Create problem directory if it doesn't exist
    const problemDir = path.join(process.cwd(), "problem")
    await fs.ensureDir(problemDir)
    const problemFilePath = path.join(problemDir, "problem.md")

    let problemDescription: string

    // Check if problem file already exists
    if (await fs.pathExists(problemFilePath)) {
      sendMessage("📄 Found existing problem file. Analyzing current problem definition...")

      try {
        const existingContent = await fs.readFile(problemFilePath, "utf-8")
        problemDescription = extractProblemFromMarkdown(existingContent)

        if (!problemDescription) {
          const errorMessage =
            "⚠️  Could not extract problem description from existing file. Please ensure your markdown file has at least one heading with content."
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
        "❌ **No problem file found!**\n\nTo use the problem analysis feature:\n1. First create a file at `problem/problem.md`\n2. Add your problem description under any heading\n3. Then run `/problem` again to get AI analysis\n\n**Example format:**\n```\n# My Startup Problem\n\nDescribe your problem here. This content will be extracted and analyzed.\n\n## Additional Details\nAny subheadings won't be included in the analysis.\n```"
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

    // Display the AI analysis in the app
    sendMessage("✅ **Analysis Results:**")
    sendMessage(aiAnalysis)

    // Additionally append the AI analysis to the problem file
    const analysisSection = `
## AI Analysis and Feedback

${aiAnalysis}

---

*Analysis generated on ${new Date().toLocaleString()}*
`

    await fs.appendFile(problemFilePath, analysisSection)

    sendMessage(`📄 Analysis also saved to: ${path.relative(process.cwd(), problemFilePath)}`)
    sendMessage(
      "─".repeat(50) +
        "\n📋 **Next Steps:**\n1. Review the analysis and action items above\n2. Complete the recommended tasks to validate your problem\n3. Update your problem definition in `problem/problem.md`\n4. Re-run `/problem` to get fresh analysis after improvements",
    )

    return messages.join("\n\n")
  } catch (error) {
    const errorMessage = `❌ Error analyzing problem: ${error instanceof Error ? error.message : "Unknown error"}`
    sendMessage(errorMessage)
    return messages.join("\n\n")
  }
}
