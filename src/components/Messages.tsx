import { Box, Text } from "ink"

import { Message } from "../types/Message"

import Divider from "./Divider"

interface MessagesProps {
  messages: Message[]
}

export const Messages: React.FC<MessagesProps> = ({ messages }) => {
  return (
    <Box flexDirection="column">
      {messages.map((message) => (
        <>
          <Divider />
          <Text key={message.id} color={message.role === "user" ? "orange" : undefined}>
            {message.role === "user" ? "> " : ""}
            {message.content}
          </Text>
        </>
      ))}
    </Box>
  )
}
