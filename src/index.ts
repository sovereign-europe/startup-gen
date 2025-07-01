#!/usr/bin/env node

import path from "path"
import fs from "fs-extra"
import { startInteractiveMode } from "./interactive"

interface ParsedArgs {
  directory?: string
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

const parsedArgs = parseArgs()
main(parsedArgs.directory)
