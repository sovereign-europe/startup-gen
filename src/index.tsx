#!/usr/bin/env node

import React from "react"
import { render } from "ink"
import meow from "meow"
import path from "path"
import fs from "fs-extra"
import { STARTUP_ASCII } from "./utils/ascii-art"
import { App } from "./components/InteractiveApp"

const cli = meow(
  `
	Usage
	  $ startup [options]

	Options
		--directory, -d  Working directory for the startup project
		--help           Show help
		--version        Show version

	Examples
	  $ startup
	  $ startup --directory=./my-startup
	  $ startup -d /path/to/startup

	The startup CLI helps early-stage startups build using lean startup methodology.
	It provides interactive guidance for customer discovery, validation, and growth.
`,
  {
    importMeta: import.meta,
    flags: {
      directory: {
        type: "string",
        shortFlag: "d",
      },
    },
  },
)

async function main() {
  try {
    console.log("─".repeat(80))
    console.log(STARTUP_ASCII)
    console.log("🚀 CLI tool for early-stage startups to build lean startup methodology")
    console.log("─".repeat(80))

    const targetDir = cli.flags.directory ? path.resolve(cli.flags.directory) : process.cwd()
    await fs.ensureDir(targetDir)

    process.chdir(targetDir)

    console.log(`📁 Working directory: ${targetDir}`)
    console.log("─".repeat(80))

    render(<App />)
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : "Unknown error")
    process.exit(1)
  }
}

// --- Global Entry Point ---
main().catch((error) => {
  console.error("An unexpected critical error occurred:")
  if (error instanceof Error) {
    console.error(error.stack)
  } else {
    console.error(String(error))
  }
  process.exit(1)
})
