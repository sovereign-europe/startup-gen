import React from "react"
import { Box, Text } from "ink"
import { ProgressBar as InkProgressBar } from "@inkjs/ui"
import { Goal } from "../Goal"

interface ProgressBarProps {
  goal: Goal
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ goal }) => {
  const progress = goal.completed / goal.target
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
        <Box width={30}>
          <InkProgressBar value={percentage} />
        </Box>
        <Text>
          {" "}
          {percentage}% ({goal.completed}/{goal.target})
        </Text>
      </Box>
    </Box>
  )
}
