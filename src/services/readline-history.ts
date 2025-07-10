import readline from "readline"

import { getUserInputHistory } from "./conversation-history"

export interface ReadlineHistoryOptions {
  prompt?: string
  validate?: (input: string) => boolean | string
}

export async function promptWithHistory(options: ReadlineHistoryOptions = {}): Promise<string> {
  const { prompt = "> ", validate } = options

  // Load user input history
  const history = await getUserInputHistory()

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      history: history.slice(0, 100), // Limit history size
      historySize: 100,
      removeHistoryDuplicates: true,
    })

    const askQuestion = () => {
      rl.question(prompt, (answer) => {
        const trimmedAnswer = answer.trim()

        if (trimmedAnswer.length === 0) {
          console.log("❌ Input cannot be empty")
          askQuestion()
          return
        }

        if (validate) {
          const validationResult = validate(trimmedAnswer)
          if (validationResult !== true) {
            const errorMessage = typeof validationResult === "string" ? validationResult : "Input cannot be empty"
            console.log(`❌ ${errorMessage}`)
            askQuestion()
            return
          }
        }

        rl.close()
        resolve(trimmedAnswer)
      })
    }

    rl.on("error", (error) => {
      rl.close()
      reject(error)
    })

    rl.on("SIGINT", () => {
      rl.close()
      reject(new Error("User force closed the prompt with Ctrl+C"))
    })

    askQuestion()
  })
}
