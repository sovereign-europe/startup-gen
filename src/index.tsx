#!/usr/bin/env node

import path from "path"

import React from "react"

import fs from "fs-extra"
import { render } from "ink"
import meow from "meow"

import { App } from "./components/App"

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
    const targetDir = cli.flags.directory ? path.resolve(cli.flags.directory) : process.cwd()
    await fs.ensureDir(targetDir)
    process.chdir(targetDir)

    render(<App workingDirectory={targetDir} />)
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
