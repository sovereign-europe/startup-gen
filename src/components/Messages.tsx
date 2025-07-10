import { Box, Text } from "ink"

import { Message } from "../types/Message"

interface MessagesProps {
  messages: Message[]
}

export const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <Box flexDirection="column">
      {messages.map((message) => (
        <Text key={message.id}>
          {message.role === "user" ? "> " : ""}
          {message.content}
        </Text>
      ))}
    </Box>
  )
}
