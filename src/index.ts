#!/usr/bin/env node

import { Command } from "commander"
import { initCommand } from "./commands/init"
import { buildCommand } from "./commands/build"
import path from "path"
import fs from "fs-extra"

const program = new Command()

program
  .name("startup")
  .description(
    "CLI tool for early-stage startups to build lean startup methodology",
  )
  .version("1.0.0")
  .option(
    "-d, --directory <dir>",
    "specify the directory to work in",
    process.cwd(),
  )

program
  .command("init")
  .description("Initialize a new startup project")
  .action(async () => {
    try {
      const options = program.opts()
      const targetDir = path.resolve(options.directory)

      // Ensure directory exists
      await fs.ensureDir(targetDir)

      // Change to target directory
      const originalCwd = process.cwd()
      process.chdir(targetDir)

      try {
        await initCommand()
      } finally {
        // Restore original working directory
        process.chdir(originalCwd)
      }
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error",
      )
      process.exit(1)
    }
  })

program
  .command("build")
  .description("Build startup components")
  .action(async () => {
    try {
      const options = program.opts()
      const targetDir = path.resolve(options.directory)

      // Ensure directory exists
      await fs.ensureDir(targetDir)

      // Change to target directory
      const originalCwd = process.cwd()
      process.chdir(targetDir)

      try {
        await buildCommand.run()
      } finally {
        // Restore original working directory
        process.chdir(originalCwd)
      }
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error",
      )
      process.exit(1)
    }
  })

program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name(),
})

program.parse()
