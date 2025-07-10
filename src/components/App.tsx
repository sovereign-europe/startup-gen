import React, { useState, useEffect } from "react"

import { StatusMessage } from "@inkjs/ui"
import { Box, Spacer, Text } from "ink"

import { getCommandNames } from "../commands/registry"
import { processInteractiveInput } from "../services/interactiveService"
import { getTokenCount } from "../services/llm"
import { validateModelConfiguration, ModelValidationResult } from "../services/modelValidation"
import { STARTUP_ASCII } from "../utils/ascii-art"

import Divider from "./Divider"
import { Messages } from "./Messages"
import { StatusPanel } from "./StatusPanel"
import { StyledTextInput } from "./StyledTextInput"

interface AppProps {
  workingDirectory: string
}

export const App: React.FC<AppProps> = ({ workingDirectory }) => {
  const [output, setOutput] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const [modelValidation, setModelValidation] = useState<ModelValidationResult | null>(null)
  const [tokenCount, setTokenCount] = useState({ sent: 0, received: 0 })

  useEffect(() => {
    const validation = validateModelConfiguration()
    setModelValidation(validation)
  }, [])

  const handleSubmit = async (userInput: string) => {
    if (userInput.trim() === "") return

    setOutput((prev) => [...prev, `> ${userInput}`])

    setIsProcessing(true)
    try {
      const result = await processInteractiveInput(userInput)
      setOutput((prev) => [...prev, result])
      setTokenCount(getTokenCount())
    } catch (error) {
      setOutput((prev) => [...prev, `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box flexDirection="column" width="80">
      <Divider />
      <Text>{STARTUP_ASCII}</Text>
      <Text>🚀 CLI tool for early-stage startups to build lean startup methodology</Text>
      <Divider />
      <Box>
        <Text>📁 Working directory: {workingDirectory}</Text>
      </Box>

      <StatusPanel></StatusPanel>
      <Divider />

      <Box flexDirection="column">
        <Text>Ask me anything about your startup, or use slash commands for specific actions.</Text>
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

      <Messages output={output} />

      <Box>
        {isProcessing ? (
          <Box>
            <Text color="white">&gt; </Text>
            <Box borderStyle="single" borderColor="white" paddingLeft={1} paddingRight={1} width={60}>
              <Text color="yellow">Processing...</Text>
            </Box>
          </Box>
        ) : (
          <StyledTextInput
            placeholder="Ask me anything about your startup..."
            onSubmit={handleSubmit}
            commands={getCommandNames().map((name) => `/${name}`)}
          />
        )}
      </Box>
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
    </Box>
  )
}
