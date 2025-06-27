import fs from "fs-extra"

export async function createReadme(startupName: string) {
  const readmeContent = `# ${startupName}

Welcome to ${startupName}! This project was initialized with Startup CLI.

## Getting Started

This is your lean startup project. Use the Startup CLI to build your customer segments, validate your ideas, and iterate quickly.

## Next Steps

1. Define your customer segments with \`startup build customer-segment\`
2. Validate your assumptions
3. Build your MVP
4. Iterate based on feedback

---
*Generated with Startup CLI*
`

  await fs.writeFile("README.md", readmeContent)
  console.log("📝 Created README.md")
}
