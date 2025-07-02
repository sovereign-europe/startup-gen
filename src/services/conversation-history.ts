import fs from "fs-extra"
import path from "path"
import { randomUUID } from "crypto"
import { Message, ConversationHistory } from "../types/conversation"

const HISTORY_DIR = ".startup"
const HISTORY_FILE = "history.json"

export async function addMessage(role: "user" | "assistant", content: string): Promise<void> {
  try {
    const historyDir = path.join(process.cwd(), HISTORY_DIR)
    const historyPath = path.join(historyDir, HISTORY_FILE)

    // Ensure the .claude directory exists
    await fs.ensureDir(historyDir)

    // Load existing history or create new
    let history: ConversationHistory = { messages: [] }
    if (await fs.pathExists(historyPath)) {
      const existingContent = await fs.readFile(historyPath, "utf-8")
      try {
        history = JSON.parse(existingContent)
      } catch {
        console.warn("Warning: Could not parse existing conversation history, starting fresh")
      }
    }

    // Create new message
    const message: Message = {
      id: randomUUID(),
      role,
      content,
      timestamp: new Date().toISOString(),
    }

    // Add message to history
    history.messages.push(message)

    // Save updated history
    await fs.writeFile(historyPath, JSON.stringify(history, null, 2))
  } catch (error) {
    console.error(
      "Warning: Failed to save conversation history:",
      error instanceof Error ? error.message : "Unknown error",
    )
  }
}

export async function getConversationHistory(): Promise<ConversationHistory> {
  try {
    const historyPath = path.join(process.cwd(), HISTORY_DIR, HISTORY_FILE)

    if (!(await fs.pathExists(historyPath))) {
      return { messages: [] }
    }

    const content = await fs.readFile(historyPath, "utf-8")
    const history: ConversationHistory = JSON.parse(content)

    // Validate the structure
    if (!history.messages || !Array.isArray(history.messages)) {
      console.warn("Warning: Invalid conversation history format, starting fresh")
      return { messages: [] }
    }

    return history
  } catch (error) {
    console.error(
      "Warning: Failed to read conversation history:",
      error instanceof Error ? error.message : "Unknown error",
    )
    return { messages: [] }
  }
}

export async function getUserInputHistory(): Promise<string[]> {
  try {
    const history = await getConversationHistory()

    // Extract only user messages and return their content in reverse order (most recent first)
    return history.messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .reverse()
  } catch (error) {
    console.error(
      "Warning: Failed to get user input history:",
      error instanceof Error ? error.message : "Unknown error",
    )
    return []
  }
}

export async function clearConversationHistory(): Promise<void> {
  try {
    const historyPath = path.join(process.cwd(), HISTORY_DIR, HISTORY_FILE)

    if (await fs.pathExists(historyPath)) {
      await fs.remove(historyPath)
    }
  } catch (error) {
    console.error(
      "Warning: Failed to clear conversation history:",
      error instanceof Error ? error.message : "Unknown error",
    )
  }
}
