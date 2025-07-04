import { findSubCommand, getCommand, getCommandNames, isValidCommand } from "../commands/registry"
import { processWithLLM } from "./llm"
import { formatLLMResponse } from "./formatLLMResponse"
import { addMessage as addMessageToHistory } from "./conversation-history"

export async function processInteractiveInput(input: string): Promise<string> {
  const lowerInput = input.toLowerCase()

  if (lowerInput.startsWith("/")) {
    const commandPart = lowerInput.substring(1)
    const [commandName, ...args] = commandPart.split(" ")

    // Save slash command to conversation history
    await addMessageToHistory("user", input)

    if (isValidCommand(commandName)) {
      const commandDef = getCommand(commandName)!
      const commandOutput = `🚀 Executing command: /${commandName}`

      await commandDef.handler()
      await addMessageToHistory("assistant", `Executed command: ${commandName}`)
      return `${commandOutput}\n\n✅ Command executed successfully`
    }

    if (args.length > 0) {
      const parentCommand = getCommand(commandName)
      if (parentCommand?.subCommands) {
        const subCommandName = args.join(" ")
        const subCommand = findSubCommand(commandName, subCommandName)

        if (subCommand) {
          const fullCommand = `${commandName} ${subCommandName}`
          const commandOutput = `🚀 Executing command: /${fullCommand}`

          await subCommand.handler(subCommandName)
          await addMessageToHistory("assistant", `Executed command: ${fullCommand}`)
          return `${commandOutput}\n\n✅ Command executed successfully`
        }
      }
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

  // Save user input to conversation history
  await addMessageToHistory("user", input)

  try {
    const response = await processWithLLM(input)
    const formattedResponse = await formatLLMResponse(response)

    // Save assistant response to conversation history
    await addMessageToHistory("assistant", response)

    return formattedResponse
  } catch (error) {
    const errorMessage = `❌ ${error}`
    const helpText = `\nℹ️  You can also use slash commands for specific actions:\n   ${getCommandNames()
      .map((name) => `/${name}`)
      .join(", ")}\n   Type '/help' to see all available commands.`

    // Save error as assistant response to conversation history
    await addMessageToHistory("assistant", `Error: ${error}`)

    return `${errorMessage}${helpText}`
  }
}
