import inquirer from "inquirer"
import { generateCustomerSegment } from "./customer-segment"
import { generateProblemAnalysis } from "./problem"

export const buildCommand = {
  async run(buildStep?: string) {
    if (buildStep) {
      // Direct mode - execute the specified build step
      await this.executeBuildStep(buildStep)
    } else {
      // Interactive mode - show selection menu
      console.log("🚀 Startup Builder")
      console.log("Choose what you'd like to build:\n")

      const { buildStep: selectedStep } = await inquirer.prompt([
        {
          type: "list",
          name: "buildStep",
          message: "What would you like to build?",
          choices: [
            {
              name: "🔍 Problem Analysis - Identify top 3 problems to solve",
              value: "problem-analysis",
            },
            {
              name: "🎯 Customer Segment - Create detailed customer personas",
              value: "customer-segment",
            },
            {
              name: "📊 Market Analysis - Analyze your market opportunity",
              value: "market-analysis",
            },
            {
              name: "💡 Value Proposition - Define your unique value",
              value: "value-proposition",
            },
            {
              name: "🛣️  Business Model - Design your business model",
              value: "business-model",
            },
            {
              name: "📈 Go-to-Market Strategy - Plan your launch",
              value: "go-to-market",
            },
          ],
        },
      ])

      await this.executeBuildStep(selectedStep)
    }
  },

  async executeBuildStep(step: string) {
    switch (step) {
      case "problem-analysis":
        await generateProblemAnalysis()
        break
      case "customer-segment":
        await generateCustomerSegment()
        break
      case "market-analysis":
        console.log("📊 Market Analysis - Coming soon!")
        console.log("This feature will help you analyze market size, competition, and opportunities.")
        break
      case "value-proposition":
        console.log("💡 Value Proposition - Coming soon!")
        console.log("This feature will help you define your unique value proposition and messaging.")
        break
      case "business-model":
        console.log("🛣️  Business Model - Coming soon!")
        console.log("This feature will help you design your revenue model and cost structure.")
        break
      case "go-to-market":
        console.log("📈 Go-to-Market Strategy - Coming soon!")
        console.log("This feature will help you plan your customer acquisition and launch strategy.")
        break
      default:
        console.error("Unknown build step:", step)
        console.log("Available build steps:")
        console.log("  - problem-analysis")
        console.log("  - customer-segment")
        console.log("  - market-analysis")
        console.log("  - value-proposition")
        console.log("  - business-model")
        console.log("  - go-to-market")
        process.exit(1)
    }
  },
}
