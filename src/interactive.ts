import { findSubCommand, generateHelpText, getCommand, getCommandNames, isValidCommand } from "./commands/registry"
import inquirer from "inquirer"
import path from "path"
import fs from "fs-extra"

export async function startInteractiveMode() {
  console.log("Enter slash commands or text. Type '/exit' or use Ctrl+C to leave.")
  console.log(
    `Available commands: ${getCommandNames()
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
          console.log(`\n🚀 Executing command: /${commandName} ${subCommandName}`)
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

  // Handle general text input - could be used for AI processing in the future
  console.log(`\n💭 You said: "${input}"`)
  console.log("🤖 Processing your input...")

  // For now, just acknowledge the input
  console.log("ℹ️  This is a text input. In the future, this could be processed by AI.")
  console.log(
    `   Current available commands: ${getCommandNames()
      .map((name) => `/${name}`)
      .join(", ")}`,
  )
  console.log("   Type '/help' to see all available commands.")
  console.log("─".repeat(50))
}

async function executeCommand(command: string) {
  const commandDef = getCommand(command)

  if (!commandDef) {
    console.error("Unknown command:", command)
    showHelp()
    process.exit(1)
    return
  }

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
