import { getCommand, getCommandNames, isValidCommand } from "../commands/registry"

import { addMessage as addMessageToHistory } from "./conversation-history"
import { formatLLMResponse } from "./formatLLMResponse"
import { processWithLLM } from "./llm"

export async function processInteractiveInput(input: string): Promise<string> {
  const lowerInput = input.toLowerCase()

  if (lowerInput.startsWith("/")) {
    const commandPart = lowerInput.substring(1)
    const [commandName] = commandPart.split(" ")

    await addMessageToHistory("user", input)

    if (isValidCommand(commandName)) {
      const commandDef = getCommand(commandName)!
      const commandOutput = `🚀 Executing command: /${commandName}`

      // Special handling for commands that return data instead of executing UI
      if (commandName === "cofounder") {
        const result = await commandDef.handler()
        await addMessageToHistory("assistant", `Started cofounder questionnaire`)
        return result as string
      }

      await commandDef.handler()
      await addMessageToHistory("assistant", `Executed command: ${commandName}`)
      return `${commandOutput}\n\n✅ Command executed successfully`
    }

    const errorMessage = `❌ Unknown command: /${commandPart}`
    const availableCommands = `Available slash commands: ${getCommandNames()
      .map((name) => `/${name}`)
      .join(", ")}`
    const helpHint = "Type /help to see all available commands."

    await addMessageToHistory(
      "assistant",
      `Unknown command: ${commandPart}. Available commands: ${getCommandNames().join(", ")}`,
    )

    return `${errorMessage}\n${availableCommands}\n${helpHint}`
  }

  await addMessageToHistory("user", input)

  try {
    const response = await processWithLLM(input)
    const formattedResponse = await formatLLMResponse(response)

    await addMessageToHistory("assistant", response)

    return formattedResponse
  } catch (error) {
    const errorMessage = `❌ ${error}`
    const helpText = `\nℹ️  You can also use slash commands for specific actions:\n   ${getCommandNames()
      .map((name) => `/${name}`)
      .join(", ")}\n   Type '/help' to see all available commands.`

    await addMessageToHistory("assistant", `Error: ${error}`)

    return `${errorMessage}${helpText}`
  }
}
