import path from "path"

import { useState, useCallback } from "react"

import fs from "fs-extra"

import { Questionnaire } from "../types/Message"

interface CofounderState {
  questionnaire: Questionnaire | null
  currentPartIndex: number
  currentQuestionIndex: number
  answers: Record<string, string[]>
  isComplete: boolean
  isLoading: boolean
  error: string | null
}

interface CofounderQuestionnaireHook {
  state: CofounderState
  startQuestionnaire: () => Promise<void>
  submitAnswer: (answer: string) => void
  getCurrentQuestion: () => string | null
  getCurrentPartHeader: () => string | null
  isLastQuestion: () => boolean
  saveAnswers: () => Promise<string>
  reset: () => void
}

export function useCofounderQuestionnaire(): CofounderQuestionnaireHook {
  const [state, setState] = useState<CofounderState>({
    questionnaire: null,
    currentPartIndex: 0,
    currentQuestionIndex: 0,
    answers: {},
    isComplete: false,
    isLoading: false,
    error: null,
  })

  const startQuestionnaire = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      // In a real app, this would be a proper path resolution
      const messagesPath = path.join(process.cwd(), "src/commands/cofounder/messages.json")
      const questionnaire: Questionnaire = await fs.readJSON(messagesPath)

      setState((prev) => ({
        ...prev,
        questionnaire,
        isLoading: false,
        currentPartIndex: 0,
        currentQuestionIndex: 0,
        answers: {},
        isComplete: false,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load questionnaire",
        isLoading: false,
      }))
    }
  }, [])

  const submitAnswer = useCallback((answer: string) => {
    setState((prev) => {
      if (!prev.questionnaire) return prev

      const currentPart = prev.questionnaire.parts[prev.currentPartIndex]
      const partHeader = currentPart.header

      // Initialize answers for this part if needed
      const updatedAnswers = { ...prev.answers }
      if (!updatedAnswers[partHeader]) {
        updatedAnswers[partHeader] = []
      }

      // Add the answer
      updatedAnswers[partHeader].push(answer)

      // Calculate next position
      let nextPartIndex = prev.currentPartIndex
      let nextQuestionIndex = prev.currentQuestionIndex + 1
      let isComplete = false

      // Check if we've finished all questions in current part
      if (nextQuestionIndex >= currentPart.questions.length) {
        nextPartIndex += 1
        nextQuestionIndex = 0

        // Check if we've finished all parts
        if (nextPartIndex >= prev.questionnaire.parts.length) {
          isComplete = true
        }
      }

      return {
        ...prev,
        answers: updatedAnswers,
        currentPartIndex: nextPartIndex,
        currentQuestionIndex: nextQuestionIndex,
        isComplete,
      }
    })
  }, [])

  const getCurrentQuestion = useCallback(() => {
    if (!state.questionnaire || state.isComplete) return null

    const currentPart = state.questionnaire.parts[state.currentPartIndex]
    if (!currentPart) return null

    return currentPart.questions[state.currentQuestionIndex] || null
  }, [state.questionnaire, state.currentPartIndex, state.currentQuestionIndex, state.isComplete])

  const getCurrentPartHeader = useCallback(() => {
    if (!state.questionnaire || state.isComplete) return null

    const currentPart = state.questionnaire.parts[state.currentPartIndex]
    return currentPart?.header || null
  }, [state.questionnaire, state.currentPartIndex, state.isComplete])

  const isLastQuestion = useCallback(() => {
    if (!state.questionnaire) return false

    const isLastPart = state.currentPartIndex === state.questionnaire.parts.length - 1
    const currentPart = state.questionnaire.parts[state.currentPartIndex]
    const isLastQuestionInPart = state.currentQuestionIndex === currentPart.questions.length - 1

    return isLastPart && isLastQuestionInPart
  }, [state.questionnaire, state.currentPartIndex, state.currentQuestionIndex])

  const saveAnswers = useCallback(async (): Promise<string> => {
    if (!state.questionnaire) {
      throw new Error("No questionnaire data to save")
    }

    const answersFileName = `cofounder-questionnaire-${new Date().toISOString().split("T")[0]}.json`
    await fs.writeJSON(
      answersFileName,
      {
        topic: state.questionnaire.topic,
        completedAt: new Date().toISOString(),
        answers: state.answers,
      },
      { spaces: 2 },
    )

    return answersFileName
  }, [state.questionnaire, state.answers])

  const reset = useCallback(() => {
    setState({
      questionnaire: null,
      currentPartIndex: 0,
      currentQuestionIndex: 0,
      answers: {},
      isComplete: false,
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    state,
    startQuestionnaire,
    submitAnswer,
    getCurrentQuestion,
    getCurrentPartHeader,
    isLastQuestion,
    saveAnswers,
    reset,
  }
}
