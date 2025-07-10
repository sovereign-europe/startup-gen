import { useState, useEffect } from "react"

import { StatusMessage } from "@inkjs/ui"
import { Box, Spacer, Text } from "ink"

import { ModelValidationResult, validateModelConfiguration } from "../services/modelValidation"

interface AiStatusProps {
  tokenCount: {
    sent: number
    received: number
  }
}

export const AiStatus: React.FC<AiStatusProps> = ({ tokenCount }) => {
  const [modelValidation, setModelValidation] = useState<ModelValidationResult | null>(null)

  useEffect(() => {
    const validation = validateModelConfiguration()
    setModelValidation(validation)
  }, [])

  return (
    <Box>
      {modelValidation && (
        <StatusMessage variant={modelValidation.isValid ? "success" : "error"}>
          {modelValidation.message}
          {modelValidation.details && ` - ${modelValidation.details}`}
        </StatusMessage>
      )}
      <Spacer />
      <Text>
        Tokens: {tokenCount.sent} sent / {tokenCount.received} received
      </Text>
    </Box>
  )
}
