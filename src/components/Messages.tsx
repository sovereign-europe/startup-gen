import { Box, Text } from "ink"

interface MessagesProps {
  output: string[]
}

export const Messages: React.FC<MessagesProps> = ({ output }) => {
  return (
    <Box flexDirection="column">
      {output.map((line, index) => (
        <Text key={index}>{line}</Text>
      ))}
    </Box>
  )
}
