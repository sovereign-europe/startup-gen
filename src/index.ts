#!/usr/bin/env node

import inquirer from "inquirer"
import { getCommand, getCommandNames, isValidCommand, findSubCommand, generateHelpText } from "./commands/registry"
import path from "path"
import fs from "fs-extra"

interface ParsedArgs {
  command?: string
  directory?: string
  showHelp?: boolean
}

function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2)
  const result: ParsedArgs = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === "-d" || arg === "--directory") {
      if (i + 1 < args.length) {
        result.directory = args[i + 1]
        i++ // Skip next argument as it's the directory value
      } else {
        console.error("❌ Error: --directory flag requires a value")
        process.exit(1)
      }
    } else if (arg === "--help" || arg === "-h") {
      result.showHelp = true
    } else if (!result.command && !arg.startsWith("-")) {
      // Support both slash and non-slash commands for CLI usage
      result.command = arg.startsWith("/") ? arg.substring(1) : arg
    }
  }

  return result
}

async function main(directory?: string) {
  try {
    console.log("─".repeat(80))
    console.log("🚀 Startup CLI")
    console.log("CLI tool for early-stage startups to build lean startup methodology")
    console.log("─".repeat(80))

    // Use command line directory or current working directory
    const targetDir = directory ? path.resolve(directory) : process.cwd()

    // Ensure directory exists
    await fs.ensureDir(targetDir)

    // Change to target directory
    const originalCwd = process.cwd()
    process.chdir(targetDir)

    // Display current working directory
    console.log(`📁 Working directory: ${targetDir}`)

    try {
      // Start interactive mode directly
      await startInteractiveMode()
    } finally {
      // Restore original working directory
      process.chdir(originalCwd)
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error")
    process.exit(1)
  }
}

async function startInteractiveMode() {
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

      // Process the input
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

function showHelp() {
  console.log(generateHelpText())
}

async function executeCommandWithDirectory(command: string, directory?: string) {
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

// Parse command line arguments
const parsedArgs = parseArgs()

if (parsedArgs.showHelp) {
  showHelp()
} else if (parsedArgs.command) {
  // Direct command mode
  if (isValidCommand(parsedArgs.command)) {
    executeCommandWithDirectory(parsedArgs.command, parsedArgs.directory).catch((error) => {
      console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error")
      process.exit(1)
    })
  } else {
    console.error("❌ Unknown command:", parsedArgs.command)
    showHelp()
    process.exit(1)
  }
} else {
  // Interactive mode
  main(parsedArgs.directory)
}
