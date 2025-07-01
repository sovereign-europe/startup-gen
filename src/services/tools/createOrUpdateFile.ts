import path from "path"
import fs from "fs-extra"

export async function createOrUpdateFile(filePath: string, content: string): Promise<void> {
  const resolvedPath = path.resolve(filePath)
  const projectRoot = process.cwd()

  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error("File path must be within the project directory")
  }

  await fs.ensureDir(path.dirname(resolvedPath))

  await fs.writeFile(resolvedPath, content, "utf-8")
}
