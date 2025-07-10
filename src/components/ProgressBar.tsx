import React from "react"

import { ProgressBar as InkProgressBar } from "@inkjs/ui"
import { Box, Text } from "ink"

import { Goal } from "../Goal"

import Divider from "./Divider"

interface ProgressBarProps {
  goal: Goal
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ goal }) => {
  const progress = goal.completed / goal.target
  const percentage = Math.round(progress * 100)

  return (
    <Box flexDirection="column">
      <Divider dividerChar="-" />
      <Box>
        <Text>Your goal: </Text>
        <Text color="green">{goal.description}</Text>
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
