import { marked } from "marked"
import { markedTerminal } from "marked-terminal"

async function parseMarkdown(text: string): Promise<string> {
  marked.use(markedTerminal())

  return marked.parse(text)
}

export async function formatLLMResponse(response: string): Promise<string> {
  try {
    const styledText = await parseMarkdown(response)

    // Split into lines and add consistent formatting
    const lines = styledText.split("\n")
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim()

      // Don't add padding to headers, lists, or special elements
      if (
        trimmed.startsWith("🎯") ||
        trimmed.startsWith("🔸") ||
        trimmed.startsWith("▪") ||
        trimmed.startsWith("•") ||
        trimmed.startsWith("📋") ||
        trimmed === "" ||
        trimmed.startsWith("─") ||
        trimmed.startsWith("💡")
      ) {
        return line
      }

      // Add light padding to regular paragraphs
      return trimmed ? `  ${trimmed}` : ""
    })

    return formattedLines.join("\n").trim()
  } catch {
    console.warn("Markdown styling failed, using plain text formatting")
    return formatPlainText(response)
  }
}

// Fallback plain text formatter (original implementation)
function formatPlainText(response: string): string {
  const lines = response.split("\n")
  const formattedLines: string[] = []

  for (const line of lines) {
    if (line.trim() === "") {
      formattedLines.push("")
      continue
    }

    const trimmedLine = line.trim()
    if (trimmedLine.length <= 70) {
      formattedLines.push(`  ${trimmedLine}`)
    } else {
      // Simple word wrapping for long lines
      const words = trimmedLine.split(" ")
      let currentLine = "  "

      for (const word of words) {
        if (currentLine.length + word.length + 1 <= 70) {
          currentLine += word + " "
        } else {
          formattedLines.push(currentLine.trim())
          currentLine = `  ${word} `
        }
      }

      if (currentLine.trim().length > 2) {
        formattedLines.push(currentLine.trim())
      }
    }
  }

  return formattedLines.join("\n")
}
