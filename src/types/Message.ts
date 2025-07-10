export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string // ISO 8601 timestamp
}

export interface QuestionnairePart {
  header: string
  questions: string[]
}
export interface Questionnaire {
  topic: string
  parts: QuestionnairePart[]
}

export interface ConversationHistory {
  messages: Message[]
}
