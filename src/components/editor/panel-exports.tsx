import React from 'react'
import { Box, Button as ChakraButton } from '@chakra-ui/react'

export interface ExportsPanelProps {
  actions: {
    component?: React.ElementType
    label?: React.ReactNode
    onClick?(): void
  }[]
}

function ExportsPanel({ ...rest }: ExportsPanelProps) {
  return (
    <Box>
      <ChakraButton>YAML</ChakraButton>
    </Box>
  )
}

export default ExportsPanel
