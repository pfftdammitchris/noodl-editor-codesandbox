import React from 'react'
import { Box, IconButton, IconButtonProps } from '@chakra-ui/react'

export interface ToolbarComponentProps {
  disabled?: boolean
  src?: string
}

function ToolbarComponent({
  children,
  src,
  disabled,
  ...rest
}: React.PropsWithChildren<ToolbarComponentProps>) {
  // const Icon = createIcon({})
  const iconButtonProps = {} as IconButtonProps

  if (src) {
    iconButtonProps.icon = <img src={src} />
    iconButtonProps.background = 'none'
  } else {
    iconButtonProps.icon = children as React.ReactElement
  }

  return (
    <Box borderRadius="50%" width={35} height={35} {...rest}>
      <IconButton {...iconButtonProps} disabled={disabled} />
    </Box>
  )
}

ToolbarComponent.whyDidYouRender = true

export default ToolbarComponent
