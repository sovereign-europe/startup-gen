import path from "path"

import fs from "fs-extra"

export async function createContext(rootDir: string = process.cwd()): Promise<string> {
  const validExtensions = [".txt", ".csv", ".md"]
  const result: string[] = ["Here is the codebase context:\n"]

  async function readFilesRecursively(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
        if (!["node_modules", ".git", "dist", ".next", "build"].includes(entry.name)) {
          await readFilesRecursively(fullPath)
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase()
        if (validExtensions.includes(ext)) {
          try {
            const content = await fs.readFile(fullPath, "utf-8")
            const relativePath = path.relative(rootDir, fullPath)
            result.push(`=== ${relativePath} ===`)
            result.push(content)
            result.push("") // Empty line separator
          } catch (error) {
            console.warn(`Warning: Could not read file ${fullPath}:`, error)
          }
        }
      }
    }
  }

  await readFilesRecursively(rootDir)

  return result.join("\n")
}
