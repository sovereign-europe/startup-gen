#!/usr/bin/env node

import path from "path"
import fs from "fs-extra"
import { startInteractiveMode, showHelp, executeCommandWithDirectory } from "./interactive"
import { isValidCommand } from "./commands/registry"

interface ParsedArgs {
  directory?: string
  command?: string
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

    const targetDir = directory ? path.resolve(directory) : process.cwd()
    await fs.ensureDir(targetDir)

    const originalCwd = process.cwd()
    process.chdir(targetDir)

    console.log(`📁 Working directory: ${targetDir}`)
    console.log("─".repeat(80))

    try {
      await startInteractiveMode()
    } finally {
      process.chdir(originalCwd)
    }
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error")
    process.exit(1)
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
