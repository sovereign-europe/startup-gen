#!/usr/bin/env node

import { Command } from "commander"
import { initCommand } from "./commands/init"
import { buildCommand } from "./commands/build"

const program = new Command()

program
  .name("startup")
  .description(
    "CLI tool for early-stage startups to build lean startup methodology",
  )
  .version("1.0.0")

program
  .command("init")
  .description("Initialize a new startup project")
  .action(async () => {
    try {
      await initCommand()
    } catch (error) {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error",
      )
      process.exit(1)
    }
  })

const buildCmd = program
  .command("build")
  .description("Build startup components")

buildCmd
  .command("customer-segment")
  .description("Create customer segment persona")
  .action(async () => {
    try {
      await buildCommand.customerSegment()
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
