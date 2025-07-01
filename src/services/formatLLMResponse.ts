export function formatLLMResponse(response: string): string {
  // Format the response for better console display
  const lines = response.split("\n")
  const formattedLines: string[] = []

  for (const line of lines) {
    if (line.trim() === "") {
      formattedLines.push("")
      continue
    }

    // Add proper indentation and wrapping for console
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
