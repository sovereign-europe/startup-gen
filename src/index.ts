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
    console.log("🚀 Startup CLI")
    console.log("CLI tool for early-stage startups to build lean startup methodology\n")

    let targetDir: string

    if (directory) {
      targetDir = path.resolve(directory)
    } else {
      // Get directory option interactively
      const { directory: selectedDirectory } = await inquirer.prompt([
        {
          type: "input",
          name: "directory",
          message: "Enter the directory to work in:",
          default: process.cwd(),
          validate: (input: string) => input.trim().length > 0 || "Directory cannot be empty",
        },
      ])
      targetDir = path.resolve(selectedDirectory)
    }

    // Ensure directory exists
    await fs.ensureDir(targetDir)

    // Change to target directory
    const originalCwd = process.cwd()
    process.chdir(targetDir)

    try {
      // Main command selection
      const { command } = await inquirer.prompt([
        {
          type: "list",
          name: "command",
          message: "What would you like to do?",
          choices: [
            {
              name: "🎯 Initialize - Set up a new startup project",
              value: "init",
            },
            {
              name: "🚀 Build - Create startup components",
              value: "build",
            },
            {
              name: "ℹ️  Help - Show available commands",
              value: "help",
            },
          ],
        },
      ])

      await executeCommand(command)
    } finally {
      // Restore original working directory
      process.chdir(originalCwd)
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error")
    process.exit(1)
  }
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
  console.log("\nOptions:")
  console.log("  -d, --directory <dir>  Specify the directory to work in")
  console.log("  -h, --help            Show help information")
  console.log("\nUsage:")
  console.log("  startup                          # Interactive mode")
  console.log("  startup <command>                # Direct command")
  console.log("  startup -d /path/to/dir <command>  # Command with directory")
  console.log("  startup --directory /path/to/dir   # Interactive mode with directory")
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
