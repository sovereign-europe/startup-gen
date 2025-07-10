import path from "path"

import fs from "fs-extra"
import inquirer from "inquirer"

import { Questionnaire } from "../../types/Message"

export async function cofounderCommand() {
  try {
    console.log("🤝 Co-founder Alignment Questionnaire")
    console.log("This questionnaire will help you and your potential co-founder align on key topics.\n")

    // Read questionnaire data
    const messagesPath = path.join(__dirname, "messages.json")
    const questionnaire: Questionnaire = await fs.readJSON(messagesPath)

    console.log(`📋 Topic: ${questionnaire.topic}\n`)

    const allAnswers: Record<string, string[]> = {}

    // Process each part of the questionnaire
    for (const part of questionnaire.parts) {
      console.log(`\n🔸 ${part.header}`)
      console.log("─".repeat(part.header.length + 2))

      const partAnswers: string[] = []

      // Ask all questions in this part
      for (let i = 0; i < part.questions.length; i++) {
        const question = part.questions[i]

        const answer = await inquirer.prompt([
          {
            type: "input",
            name: "response",
            message: `${i + 1}. ${question}`,
            validate: (input: string) => input.trim().length > 0 || "Please provide an answer",
          },
        ])

        partAnswers.push(answer.response)
      }

      allAnswers[part.header] = partAnswers
    }

    // Save answers to a file
    const answersFileName = `cofounder-questionnaire-${new Date().toISOString().split("T")[0]}.json`
    await fs.writeJSON(
      answersFileName,
      {
        topic: questionnaire.topic,
        completedAt: new Date().toISOString(),
        answers: allAnswers,
      },
      { spaces: 2 },
    )

    console.log(`\n✅ Questionnaire completed successfully!`)
    console.log(`📄 Your answers have been saved to: ${answersFileName}`)
    console.log(`\n💡 Share this file with your potential co-founder to compare answers and discuss alignment.`)
  } catch (error) {
    console.error("Error during co-founder questionnaire:", error)
    process.exit(1)
  }
}
