#!/usr/bin/env node

import inquirer from "inquirer"
import { initCommand } from "./commands/init"
import { buildCommand } from "./commands/build"
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
      result.command = arg
    }
  }

  return result
}

async function main(directory?: string) {
  try {
    console.log("─".repeat(50))
    console.log("🚀 Startup CLI")
    console.log("CLI tool for early-stage startups to build lean startup methodology")
    console.log("─".repeat(50))

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
  console.log("\n💬 Interactive Mode")
  console.log("Enter commands or text. Type 'quit', 'exit', or 'q' to leave.")
  console.log("Available commands: init, build, help")
  console.log("─".repeat(50))

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

      const trimmedInput = input.trim().toLowerCase()

      // Check for quit commands
      if (["quit", "exit", "q"].includes(trimmedInput)) {
        console.log("👋 Goodbye!")
        isRunning = false
        continue
      }

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

  // Handle direct commands
  if (["init", "build", "help"].includes(lowerInput)) {
    console.log(`\n🚀 Executing command: ${lowerInput}`)
    await executeCommand(lowerInput)
    console.log("─".repeat(50))
    return
  }

  // Handle build sub-commands
  if (lowerInput.startsWith("build ")) {
    const buildStep = lowerInput.substring(6).trim()
    console.log(`\n🚀 Executing build command: ${buildStep}`)
    await buildCommand.run(buildStep)
    console.log("─".repeat(50))
    return
  }

  // Handle general text input - could be used for AI processing in the future
  console.log(`\n💭 You said: "${input}"`)
  console.log("🤖 Processing your input...")

  // For now, just acknowledge the input
  console.log("ℹ️  This is a text input. In the future, this could be processed by AI.")
  console.log("   Current available commands: init, build [step], help")
  console.log("   Type 'help' to see all available commands.")
  console.log("─".repeat(50))
}

async function executeCommand(command: string) {
  switch (command) {
    case "init":
      await initCommand()
      break
    case "build":
      await buildCommand.run()
      break
    case "help":
      showHelp()
      break
    default:
      console.error("Unknown command:", command)
      showHelp()
      process.exit(1)
  }
}

function showHelp() {
  console.log("\n📖 Available Commands:")
  console.log("  🎯 init  - Initialize a new startup project")
  console.log("  🚀 build - Build startup components (problem-analysis, customer-segment, etc.)")
  console.log("    • build customer-segment - Create customer personas")
  console.log("    • build problem-analysis - Identify top problems")
  console.log("    • build market-analysis - Analyze market opportunity")
  console.log("\nInteractive Commands:")
  console.log("  💬 quit, exit, q - Exit the application")
  console.log("  📝 <text> - General text input (future AI processing)")
  console.log("\nOptions:")
  console.log("  -d, --directory <dir>  Specify working directory (default: current directory)")
  console.log("  -h, --help            Show help information")
  console.log("\nUsage:")
  console.log("  startup                            # Interactive mode in current directory")
  console.log("  startup <command>                  # Direct command execution")
  console.log("  startup -d /path/to/dir            # Interactive mode in custom directory")
  console.log("  startup -d /path/to/dir <command>  # Direct command in custom directory")
  console.log("\nInteractive Experience:")
  console.log("  Similar to Claude Code - continuous input until you quit")
  console.log("  Type commands directly or enter any text for processing")
  console.log("  Working directory is set once at startup and cannot be changed")
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
  const allowedCommands = ["init", "build", "help"]

  if (allowedCommands.includes(parsedArgs.command)) {
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
