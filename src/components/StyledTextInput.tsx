import React, { useState } from "react"
import { Box, Text } from "ink"
import { TextInput } from "@inkjs/ui"

interface StyledTextInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
  commands: string[]
}

export const StyledTextInput: React.FC<StyledTextInputProps> = ({
  placeholder = "Type your message...",
  onSubmit,
  commands,
}) => {
  const [, setValue] = useState("")

  return (
    <Box borderStyle="single" borderColor="grey" paddingLeft={1} paddingRight={1} width="100%">
      <Text color="white">&gt; </Text>
      <Box flexDirection="column" gap={1}>
        <TextInput placeholder={placeholder} onChange={setValue} onSubmit={onSubmit} suggestions={commands} />
      </Box>
    </Box>
  )
}
