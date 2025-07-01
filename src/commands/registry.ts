import { initCommand } from "./init"
import { buildCommand } from "./build"

export interface CommandDefinition {
  name: string
  description: string
  icon: string
  category: "core" | "build" | "system"
  handler: () => Promise<void> | void
  subCommands?: SubCommandDefinition[]
}

export interface SubCommandDefinition {
  name: string
  description: string
  handler: (args?: string) => Promise<void> | void
}

export const COMMAND_REGISTRY: Record<string, CommandDefinition> = {
  init: {
    name: "init",
    description: "Initialize a new startup project",
    icon: "🎯",
    category: "core",
    handler: async () => {
      await initCommand()
    },
  },
  build: {
    name: "build",
    description: "Build startup components (problem-analysis, customer-segment, etc.)",
    icon: "🚀",
    category: "build",
    handler: async () => {
      await buildCommand.run()
    },
    subCommands: [
      {
        name: "customer-segment",
        description: "Create customer personas",
        handler: async () => {
          await buildCommand.run("customer-segment")
        },
      },
      {
        name: "problem-analysis",
        description: "Identify top problems",
        handler: async () => {
          await buildCommand.run("problem-analysis")
        },
      },
      {
        name: "market-analysis",
        description: "Analyze market opportunity",
        handler: async () => {
          await buildCommand.run("market-analysis")
        },
      },
      {
        name: "value-proposition",
        description: "Define your unique value",
        handler: async () => {
          await buildCommand.run("value-proposition")
        },
      },
      {
        name: "business-model",
        description: "Design your business model",
        handler: async () => {
          await buildCommand.run("business-model")
        },
      },
      {
        name: "go-to-market",
        description: "Plan your launch",
        handler: async () => {
          await buildCommand.run("go-to-market")
        },
      },
    ],
  },
  help: {
    name: "help",
    description: "Show this help information",
    icon: "ℹ️",
    category: "system",
    handler: () => {
      // This will be implemented in the main file
      throw new Error("Help handler should be implemented in main file")
    },
  },
  exit: {
    name: "exit",
    description: "Exit the application",
    icon: "👋",
    category: "system",
    handler: () => {
      console.log("👋 Goodbye!")
      process.exit(0)
    },
  },
}

// Utility functions for working with the registry
export function getCommand(name: string): CommandDefinition | undefined {
  return COMMAND_REGISTRY[name]
}

export function getCommandNames(): string[] {
  return Object.keys(COMMAND_REGISTRY)
}

export function getCommandsByCategory(category: CommandDefinition["category"]): CommandDefinition[] {
  return Object.values(COMMAND_REGISTRY).filter((cmd) => cmd.category === category)
}

export function isValidCommand(name: string): boolean {
  return name in COMMAND_REGISTRY
}

export function getAllCommands(): CommandDefinition[] {
  return Object.values(COMMAND_REGISTRY)
}

export function findSubCommand(commandName: string, subCommandName: string): SubCommandDefinition | undefined {
  const command = getCommand(commandName)
  return command?.subCommands?.find((sub) => sub.name === subCommandName)
}

export function generateHelpText(): string {
  const lines: string[] = []

  lines.push("\n📖 Available Slash Commands:")

  // Group by category
  const categories = ["core", "build", "system"] as const

  for (const category of categories) {
    const commands = getCommandsByCategory(category)
    if (commands.length === 0) continue

    for (const command of commands) {
      lines.push(`  ${command.icon} /${command.name}  - ${command.description}`)

      // Add sub-commands if they exist
      if (command.subCommands) {
        for (const subCmd of command.subCommands) {
          lines.push(`    • /${command.name} ${subCmd.name} - ${subCmd.description}`)
        }
      }
    }
  }

  lines.push("\nInteractive Input:")
  lines.push("  📝 <text> - General text input (future AI processing)")
  lines.push("  💬 Use slash commands (/) like Claude Code for explicit commands")

  lines.push("\nCLI Options:")
  lines.push("  -d, --directory <dir>  Specify working directory (default: current directory)")
  lines.push("  -h, --help            Show help information")

  lines.push("\nUsage:")
  lines.push("  startup                            # Interactive mode in current directory")
  lines.push("  startup <command>                  # Direct command execution (without /)")
  lines.push("  startup -d /path/to/dir            # Interactive mode in custom directory")
  lines.push("  startup -d /path/to/dir <command>  # Direct command in custom directory")

  lines.push("\nInteractive Experience:")
  lines.push("  Similar to Claude Code - continuous input until you exit")
  lines.push("  Use /command for explicit commands, or type text for AI processing")
  lines.push("  Working directory is set once at startup and cannot be changed")

  return lines.join("\n")
}
