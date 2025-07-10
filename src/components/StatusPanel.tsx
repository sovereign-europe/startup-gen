import { useState, useEffect } from "react"

import { Box, Text } from "ink"

import { Goal } from "../Goal"
import { completedCustomerInterviews, watchCustomerInterviews } from "../services/goalService"

import Divider from "./Divider"
import { ProgressBar } from "./ProgressBar"

export const StatusPanel = () => {
  const [customerInterviewCount, setCustomerInterviewCount] = useState(completedCustomerInterviews())

  useEffect(() => {
    const cleanup = watchCustomerInterviews((count) => {
      setCustomerInterviewCount(count)
    })
    return cleanup
  }, [])
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

  return (
    <>
      <Box>
        <Text>Your current stage: Finding product-market fit</Text>
      </Box>
      <ProgressBar goal={customerInterviewGoal} />
      <ProgressBar goal={coFounderGoal} />
      <Divider width={80} />
    </>
  )
}
