import React from 'react'
import { Flex, FlexProps, Text, TextProps } from '@chakra-ui/react'

export interface KeyValueFieldBaseProps {
  label?: string | React.ReactElement
  containerProps?: FlexProps
  textProps?: TextProps
}

function KeyValueFieldBase({
  children,
  label = '',
  containerProps,
  textProps,
}: React.PropsWithChildren<KeyValueFieldBaseProps>) {
  return (
    <Flex alignItems="center" {...containerProps}>
      <Text w={110} fontSize="xs" {...textProps}>
        {label}
      </Text>
      {children}
    </Flex>
  )
}

KeyValueFieldBase.whyDidYouRender = true

export default KeyValueFieldBase
