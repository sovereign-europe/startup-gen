import fs from "fs-extra"
import path from "path"

const HISTORY_DIR = ".startup"
const HISTORY_FILE = "history.txt"

export async function logCommand(command: string): Promise<void> {
  try {
    const historyDir = path.join(process.cwd(), HISTORY_DIR)
    const historyPath = path.join(historyDir, HISTORY_FILE)

    // Ensure the .startup-gen directory exists
    await fs.ensureDir(historyDir)

    // Create timestamp for the command
    const timestamp = new Date().toISOString()
    const logEntry = `${timestamp} - ${command}\n`

    // Append to history file
    await fs.appendFile(historyPath, logEntry)
  } catch (error) {
    // Silently fail to avoid disrupting the user experience
    console.error(
      "Warning: Failed to log command to history:",
      error instanceof Error ? error.message : "Unknown error",
    )
  }
}

export async function getCommandHistory(): Promise<string[]> {
  try {
    const historyPath = path.join(process.cwd(), HISTORY_DIR, HISTORY_FILE)

    if (!(await fs.pathExists(historyPath))) {
      return []
    }

    const content = await fs.readFile(historyPath, "utf-8")
    return content.split("\n").filter((line) => line.trim().length > 0)
  } catch (error) {
    console.error("Warning: Failed to read command history:", error instanceof Error ? error.message : "Unknown error")
    return []
  }
}
