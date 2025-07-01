import { findSubCommand, generateHelpText, getCommand, getCommandNames, isValidCommand } from "./commands/registry"
import { processWithLLM } from "./services/llm"
import inquirer from "inquirer"
import path from "path"
import fs from "fs-extra"
import { formatLLMResponse } from "./services/formatLLMResponse"
import { logCommand } from "./services/history"

export async function startInteractiveMode() {
  console.log("💬 Interactive AI Startup Coach")
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
      const { input } = await inquirer.prompt([
        {
          type: "input",
          name: "input",
          message: ">",
          validate: (input: string) => input.trim().length > 0 || "Input cannot be empty",
        },
      ])

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

  // Handle slash commands
  if (lowerInput.startsWith("/")) {
    const commandPart = lowerInput.substring(1)
    const [commandName, ...args] = commandPart.split(" ")

    // Check if it's a direct command
    if (isValidCommand(commandName)) {
      const commandDef = getCommand(commandName)!
      console.log(`\n🚀 Executing command: /${commandName}`)

      // Log the command to history
      await logCommand(commandName)

      // Special handling for help command
      if (commandName === "help") {
        showHelp()
      } else {
        await commandDef.handler()
      }
      console.log("─".repeat(50))
      return
    }

    // Check if it's a sub-command (e.g., "build customer-segment")
    if (args.length > 0) {
      const parentCommand = getCommand(commandName)
      if (parentCommand?.subCommands) {
        const subCommandName = args.join(" ")
        const subCommand = findSubCommand(commandName, subCommandName)

        if (subCommand) {
          const fullCommand = `${commandName} ${subCommandName}`
          console.log(`\n🚀 Executing command: /${fullCommand}`)

          // Log the full command to history
          await logCommand(fullCommand)

          await subCommand.handler(subCommandName)
          console.log("─".repeat(50))
          return
        }
      }
    }

    // Unknown slash command
    console.log(`\n❌ Unknown command: /${commandPart}`)
    console.log(
      `Available slash commands: ${getCommandNames()
        .map((name) => `/${name}`)
        .join(", ")}`,
    )
    console.log("Type /help to see all available commands.")
    console.log("─".repeat(50))
    return
  }

  try {
    const response = await processWithLLM(input)
    console.log("\n🎯 AI Startup Coach:")
    console.log(await formatLLMResponse(response))
  } catch (error) {
    console.log(`\n❌ ${error}`)
    console.log("\nℹ️  You can also use slash commands for specific actions:")
    console.log(
      `   ${getCommandNames()
        .map((name) => `/${name}`)
        .join(", ")}`,
    )
    console.log("   Type '/help' to see all available commands.")
  }

  console.log("─".repeat(80))
}

async function executeCommand(command: string) {
  const commandDef = getCommand(command)

  if (!commandDef) {
    console.error("Unknown command:", command)
    showHelp()
    process.exit(1)
    return
  }

  // Log the command to history
  await logCommand(command)

  if (command === "help") {
    showHelp()
  } else {
    await commandDef.handler()
  }
}

export function showHelp() {
  console.log(generateHelpText())
}

export async function executeCommandWithDirectory(command: string, directory?: string) {
  // Ensure directory exists and change to it
  if (directory) {
    const targetDir = path.resolve(directory)
    await fs.ensureDir(targetDir)

    const originalCwd = process.cwd()
    process.chdir(targetDir)

    try {
      await executeCommand(command)
    } finally {
      process.chdir(originalCwd)
    }
  } else {
    await executeCommand(command)
  }
}
