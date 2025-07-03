export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string // ISO 8601 timestamp
}

export interface ConversationHistory {
  messages: Message[]
}
