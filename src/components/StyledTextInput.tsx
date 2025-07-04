import React, { useState } from "react"
import { Box, Text, useInput } from "ink"

interface StyledTextInputProps {
  placeholder?: string
  onSubmit: (value: string) => void
}

export const StyledTextInput: React.FC<StyledTextInputProps> = ({ placeholder = "Type your message...", onSubmit }) => {
  const [value, setValue] = useState("")
  const [cursor, setCursor] = useState(0)

  useInput((input, key) => {
    if (key.return) {
      if (value.trim()) {
        onSubmit(value.trim())
        setValue("")
        setCursor(0)
      }
    } else if (key.backspace || key.delete) {
      if (cursor > 0) {
        setValue((prev) => prev.slice(0, cursor - 1) + prev.slice(cursor))
        setCursor((prev) => prev - 1)
      }
    } else if (key.leftArrow) {
      setCursor((prev) => Math.max(0, prev - 1))
    } else if (key.rightArrow) {
      setCursor((prev) => Math.min(value.length, prev + 1))
    } else if (input && !key.ctrl && !key.meta) {
      setValue((prev) => prev.slice(0, cursor) + input + prev.slice(cursor))
      setCursor((prev) => prev + 1)
    }
  })

  const displayValue = value || placeholder
  const isPlaceholder = value === ""

  // Create the text with cursor
  const beforeCursor = displayValue.slice(0, cursor)
  const atCursor = displayValue[cursor] || " "
  const afterCursor = displayValue.slice(cursor + 1)

  return (
    <Box>
      <Box borderStyle="single" borderColor="white" paddingLeft={1} paddingRight={1} width={80}>
        <Text color="white">&gt; </Text>
        <Text color={isPlaceholder ? "gray" : "white"}>
          {beforeCursor}
          <Text backgroundColor="white" color="black">
            {atCursor}
          </Text>
          {afterCursor}
        </Text>
      </Box>
    </Box>
  )
}
