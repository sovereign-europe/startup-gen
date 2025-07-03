import { findSubCommand, generateHelpText, getCommand, getCommandNames, isValidCommand } from "./commands/registry"
import { processWithLLM } from "./services/llm"
import { formatLLMResponse } from "./services/formatLLMResponse"
import { addMessage } from "./services/conversation-history"
import { promptWithHistory } from "./services/readline-history"

function progress(): number {
  return 1.0 / 15
}

export async function startInteractiveMode() {
  console.log("Your current stage: Finding product-market fit")
  console.log("Your goal:          Interview 15 customers")

  // Show progress bar
  const progressValue = progress()
  const totalBars = 15
  const filledBars = Math.floor(progressValue * totalBars)
  const emptyBars = totalBars - filledBars
  const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars)
  const percentage = Math.round(progressValue * 100)
  console.log(`Progress:           [${progressBar}] ${percentage}% (${filledBars}/15)`)

  console.log("─".repeat(80))
  console.log("Ask me anything about your startup, or use slash commands for specific actions.")
  console.log("Type '/exit' or use Ctrl+C to leave.")
  console.log("")
  console.log("🎯 Examples:")
  console.log("  'How do I validate my startup idea?'")
  console.log("  'What should I do first as a new founder?'")
  console.log("  '/init' (to set up a new project)")
  console.log("  '/build customer-segment' (to create personas)")
  console.log("")
  console.log(
    `Slash commands: ${getCommandNames()
      .map((name) => `/${name}`)
      .join(", ")}`,
  )
  console.log("─".repeat(80))

  let isRunning = true

  while (isRunning) {
    try {
      const input = await promptWithHistory({
        prompt: "> ",
        validate: (input: string) => input.trim().length > 0 || "Input cannot be empty",
      })

      await processInteractiveInput(input.trim())
    } catch (error) {
      if (error instanceof Error && error.message.includes("User force closed")) {
        console.log("\n👋 Goodbye!")
        isRunning = false
      } else {
        console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error")
      }
    }
  }
}

async function processInteractiveInput(input: string) {
  const lowerInput = input.toLowerCase()

  if (lowerInput.startsWith("/")) {
    const commandPart = lowerInput.substring(1)
    const [commandName, ...args] = commandPart.split(" ")

    // Save slash command to conversation history
    await addMessage("user", input)

    if (isValidCommand(commandName)) {
      const commandDef = getCommand(commandName)!
      console.log(`\n🚀 Executing command: /${commandName}`)

      if (commandName === "help") {
        showHelp()
        await addMessage("assistant", "Help information displayed")
      } else {
        await commandDef.handler()
        await addMessage("assistant", `Executed command: ${commandName}`)
      }
      console.log("─".repeat(50))
      return
    }

    if (args.length > 0) {
      const parentCommand = getCommand(commandName)
      if (parentCommand?.subCommands) {
        const subCommandName = args.join(" ")
        const subCommand = findSubCommand(commandName, subCommandName)

        if (subCommand) {
          const fullCommand = `${commandName} ${subCommandName}`
          console.log(`\n🚀 Executing command: /${fullCommand}`)

          await subCommand.handler(subCommandName)
          await addMessage("assistant", `Executed command: ${fullCommand}`)
          console.log("─".repeat(50))
          return
        }
      }
    }

    console.log(`\n❌ Unknown command: /${commandPart}`)
    console.log(
      `Available slash commands: ${getCommandNames()
        .map((name) => `/${name}`)
        .join(", ")}`,
    )
    console.log("Type /help to see all available commands.")
    await addMessage(
      "assistant",
      `Unknown command: ${commandPart}. Available commands: ${getCommandNames().join(", ")}`,
    )
    console.log("─".repeat(50))
    return
  }

  // Save user input to conversation history
  await addMessage("user", input)

  try {
    const response = await processWithLLM(input)
    console.log("─".repeat(80))
    const formattedResponse = await formatLLMResponse(response)
    console.log(formattedResponse)

    // Save assistant response to conversation history
    await addMessage("assistant", response)
  } catch (error) {
    console.log(`\n❌ ${error}`)
    console.log("\nℹ️  You can also use slash commands for specific actions:")
    console.log(
      `   ${getCommandNames()
        .map((name) => `/${name}`)
        .join(", ")}`,
    )
    console.log("   Type '/help' to see all available commands.")

    // Save error as assistant response to conversation history
    await addMessage("assistant", `Error: ${error}`)
  }

  console.log("─".repeat(80))
}

export function showHelp() {
  console.log(generateHelpText())
}
