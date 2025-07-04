import React, { useState, useEffect } from "react"
import { Box, Text, useApp } from "ink"
import { TextInput } from "@inkjs/ui"
import { ProgressBar } from "./ProgressBar"
import { Goal } from "../Goal"
import { processInteractiveInput } from "../services/interactiveService"
import { completedCustomerInterviews, watchCustomerInterviews } from "../services/goalService"
import { getCommandNames } from "../commands/registry"

export const InteractiveApp: React.FC = () => {
  const { exit } = useApp()
  const [output, setOutput] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerInterviewCount, setCustomerInterviewCount] = useState(completedCustomerInterviews())

  const customerInterviewGoal: Goal = {
    description: "Interview potential customers",
    target: 15,
    completed: customerInterviewCount,
  }

  const coFounderGoal: Goal = {
    description: "Find a co-founder",
    target: 3,
    completed: 1,
  }

  useEffect(() => {
    const cleanup = watchCustomerInterviews((count) => {
      setCustomerInterviewCount(count)
    })

    return cleanup
  }, [])

  const handleSubmit = async (userInput: string) => {
    if (userInput.trim() === "") return

    setOutput((prev) => [...prev, `> ${userInput}`])

    if (userInput.toLowerCase() === "/exit") {
      exit()
      return
    }

    setIsProcessing(true)
    try {
      const result = await processInteractiveInput(userInput)
      setOutput((prev) => [...prev, result])
    } catch (error) {
      setOutput((prev) => [...prev, `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box flexDirection="column" gap={1}>
      <Box>
        <Text>Your current stage: Finding product-market fit</Text>
      </Box>

      <ProgressBar goal={customerInterviewGoal} />
      <ProgressBar goal={coFounderGoal} />

      <Box>
        <Text>{"─".repeat(80)}</Text>
      </Box>

      <Box flexDirection="column">
        <Text>Ask me anything about your startup, or use slash commands for specific actions.</Text>
        <Text>Type '/exit' or use Ctrl+C to leave.</Text>
        <Text></Text>
        <Text>🎯 Examples:</Text>
        <Text> 'How do I validate my startup idea?'</Text>
        <Text> 'What should I do first as a new founder?'</Text>
        <Text> '/init' (to set up a new project)</Text>
        <Text> '/build customer-segment' (to create personas)</Text>
        <Text></Text>
        <Text>
          Slash commands:{" "}
          {getCommandNames()
            .map((name) => `/${name}`)
            .join(", ")}
        </Text>
      </Box>

      <Box>
        <Text>{"─".repeat(80)}</Text>
      </Box>

      <Box flexDirection="column">
        {output.map((line, index) => (
          <Text key={index}>{line}</Text>
        ))}
      </Box>

      <Box>
        {isProcessing ? (
          <Text>Processing...</Text>
        ) : (
          <TextInput placeholder="Ask me anything about your startup..." onSubmit={handleSubmit} />
        )}
      </Box>
    </Box>
  )
}
