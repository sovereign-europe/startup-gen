import React from "react"
import { Box, Text } from "ink"
import { Goal } from "../Goal"

interface ProgressBarProps {
  goal: Goal
  totalBars?: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ goal, totalBars = 15 }) => {
  const progress = goal.completed / goal.target
  const filledBars = Math.floor(progress * totalBars)
  const emptyBars = totalBars - filledBars
  const progressBar = "█".repeat(filledBars) + "░".repeat(emptyBars)
  const percentage = Math.round(progress * 100)

  return (
    <Box flexDirection="column">
      <Box>
        <Text>{"─ ".repeat(40)}</Text>
      </Box>
      <Box>
        <Text>Your goal: </Text>
        <Text>{goal.description}</Text>
      </Box>
      <Box>
        <Text>Progress: </Text>
        <Text>
          [{progressBar}] {percentage}% ({goal.completed}/{goal.target})
        </Text>
      </Box>
    </Box>
  )
}
