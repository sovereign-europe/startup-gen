// Helper function to extract problem description from existing markdown file
// Takes content from the first heading that has content and no direct subheadings
export function extractProblemFromMarkdown(content: string): string {
  const lines = content.split("\n")
  let currentHeadingContent: string[] = []
  let foundFirstContentHeading = false
  let currentHeadingLevel = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Check if this is a heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      const headingLevel = headingMatch[1].length

      // If we already found a content heading and this is a subheading (higher level number)
      if (foundFirstContentHeading && headingLevel > currentHeadingLevel) {
        // This is a subheading of our current section, so we stop here
        break
      }

      // If we already found a content heading and this is same or higher level heading (lower level number)
      if (foundFirstContentHeading && headingLevel <= currentHeadingLevel) {
        // This is a new section at same or higher level, so we stop here
        break
      }

      // If we haven't found a content heading yet, start tracking this one
      if (!foundFirstContentHeading) {
        currentHeadingLevel = headingLevel
        currentHeadingContent = []
        // Continue to next line to start collecting content
        continue
      }
    }

    // If we're tracking a heading, collect its content
    if (currentHeadingLevel > 0) {
      // Skip horizontal rules and empty lines at the start
      if (line.startsWith("---") || line.trim() === "") {
        if (currentHeadingContent.length > 0) {
          // If we already have content, empty line might be end of section
          continue
        } else {
          // Skip empty lines before content starts
          continue
        }
      }

      // Add content line
      if (line.trim()) {
        currentHeadingContent.push(line.trim())
        foundFirstContentHeading = true
      }
    }
  }

  return currentHeadingContent.join(" ").trim()
}
