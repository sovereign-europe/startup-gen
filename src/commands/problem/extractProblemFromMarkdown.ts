// Helper function to extract problem description from existing markdown file
export function extractProblemFromMarkdown(content: string): string {
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
