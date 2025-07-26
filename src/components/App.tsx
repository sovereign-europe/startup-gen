import React, { useState, useEffect } from "react"

import { Spinner } from "@inkjs/ui"
import { Box, Text } from "ink"

import { getCommandNames } from "../commands/registry"
import { useCofounderQuestionnaire } from "../hooks/useCofounderQuestionnaire"
import { processInteractiveInput, processProblemInput } from "../services/interactiveService"
import { getTokenCount } from "../services/llm"
import { Message } from "../types/Message"
import { STARTUP_ASCII } from "../utils/ascii-art"

import { AiStatus } from "./AiStatus"
import Divider from "./Divider"
import { Messages } from "./Messages"
import { StyledTextInput } from "./StyledTextInput"

interface AppProps {
  workingDirectory: string
}

export const App: React.FC<AppProps> = ({ workingDirectory }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [tokenCount, setTokenCount] = useState({ sent: 0, received: 0 })
  const [waitingForProblemInput, setWaitingForProblemInput] = useState(false)

  const cofounderQuestionnaire = useCofounderQuestionnaire()

  // Effect to show current question when questionnaire state changes
  useEffect(() => {
    if (cofounderQuestionnaire.state.questionnaire && !cofounderQuestionnaire.state.isComplete) {
      const currentQuestion = cofounderQuestionnaire.getCurrentQuestion()
      const currentPartHeader = cofounderQuestionnaire.getCurrentPartHeader()

      if (currentQuestion && currentPartHeader) {
        const partMessage: Message = {
          id: `part-${Date.now()}`,
          role: "assistant",
          content: `\n🔸 ${currentPartHeader}\n${"─".repeat(currentPartHeader.length + 2)}`,
          timestamp: new Date().toISOString(),
        }

        const questionMessage: Message = {
          id: `question-${Date.now()}`,
          role: "assistant",
          content: `${cofounderQuestionnaire.state.currentQuestionIndex + 1}. ${currentQuestion}`,
          timestamp: new Date().toISOString(),
        }

        // Only add part header if it's the first question in the part
        if (cofounderQuestionnaire.state.currentQuestionIndex === 0) {
          setMessages((prev) => [...prev, partMessage, questionMessage])
        } else {
          setMessages((prev) => [...prev, questionMessage])
        }
      }
    }
  }, [cofounderQuestionnaire.state.currentPartIndex, cofounderQuestionnaire.state.currentQuestionIndex])

  const handleSubmit = async (userInput: string) => {
    if (userInput.trim() === "") return

    // If we're waiting for problem input, handle it specially
    if (waitingForProblemInput) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      setIsProcessing(true)
      setWaitingForProblemInput(false)

      try {
        const result = await processProblemInput(userInput)
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
      return
    }

    // If we're in cofounder questionnaire mode, handle answers differently
    if (cofounderQuestionnaire.state.questionnaire && !cofounderQuestionnaire.state.isComplete) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, userMessage])

      // Submit the answer to the questionnaire
      cofounderQuestionnaire.submitAnswer(userInput)

      // Check if questionnaire is complete
      if (cofounderQuestionnaire.state.isComplete) {
        try {
          const fileName = await cofounderQuestionnaire.saveAnswers()
          const completionMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `✅ Questionnaire completed successfully!\n📄 Your answers have been saved to: ${fileName}\n\n💡 Share this file with your potential co-founder to compare answers and discuss alignment.`,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, completionMessage])
        } catch (error) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `❌ Error saving answers: ${error instanceof Error ? error.message : "Unknown error"}`,
            timestamp: new Date().toISOString(),
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      }
      return
    }

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

      // Check if result is a cofounder questionnaire start signal
      if (result === "COFOUNDER_QUESTIONNAIRE_START") {
        await cofounderQuestionnaire.startQuestionnaire()
        const welcomeMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "🤝 Co-founder Alignment Questionnaire\n\nThis questionnaire will help you and your potential co-founder align on key topics.\n\nPress Enter to continue...",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, welcomeMessage])
      } else if (result === "PROBLEM_INPUT_NEEDED") {
        // Problem command needs user input to create problem file
        setWaitingForProblemInput(true)
        const promptMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "🤔 What is the problem you're solving?",
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, promptMessage])
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
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

      {/* <StatusPanel></StatusPanel> */}
      <Divider />

      <Box flexDirection="column">
        <Text>Ask me anything about your startup, or use slash commands for specific actions.</Text>
        <Box marginTop={1} />
        <Text>Examples:</Text>
        <Text> 'How do I validate my startup idea?'</Text>
        <Text> 'What should I do first as a new founder?'</Text>
        <Box marginTop={1} />
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
            placeholder={
              waitingForProblemInput
                ? "Enter your problem description..."
                : cofounderQuestionnaire.state.questionnaire && !cofounderQuestionnaire.state.isComplete
                  ? "Enter your answer..."
                  : "Ask me anything about your startup..."
            }
            onSubmit={handleSubmit}
            commands={getCommandNames().map((name) => `/${name}`)}
          />
        )}
      </Box>
      <AiStatus tokenCount={tokenCount}></AiStatus>
    </Box>
  )
}
