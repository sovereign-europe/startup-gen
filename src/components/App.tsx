import React, { useState } from "react"

import { Spinner } from "@inkjs/ui"
import { Box, Text } from "ink"

import { getCommandNames } from "../commands/registry"
import { processInteractiveInput } from "../services/interactiveService"
import { getTokenCount } from "../services/llm"
import { Message } from "../types/Message"
import { STARTUP_ASCII } from "../utils/ascii-art"

import { AiStatus } from "./AiStatus"
import Divider from "./Divider"
import { Messages } from "./Messages"
import { StatusPanel } from "./StatusPanel"
import { StyledTextInput } from "./StyledTextInput"

interface AppProps {
  workingDirectory: string
}

export const App: React.FC<AppProps> = ({ workingDirectory }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const [tokenCount, setTokenCount] = useState({ sent: 0, received: 0 })

  const handleSubmit = async (userInput: string) => {
    if (userInput.trim() === "") return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userInput,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])

    setIsProcessing(true)
    try {
      const result = await processInteractiveInput(userInput)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setTokenCount(getTokenCount())
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

      <Messages messages={messages} />

      <Box>
        {isProcessing ? (
          <Spinner label="Loading" />
        ) : (
          <StyledTextInput
            placeholder="Ask me anything about your startup..."
            onSubmit={handleSubmit}
            commands={getCommandNames().map((name) => `/${name}`)}
          />
        )}
      </Box>
      <AiStatus tokenCount={tokenCount}></AiStatus>
    </Box>
  )
}
