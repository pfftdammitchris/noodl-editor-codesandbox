import React from 'react'
import { Box, BoxProps, IconProps, forwardRef } from '@chakra-ui/react'
import { Layout } from 'react-grid-layout'

export interface EditorPanelProps {
  id?: string
  className?: string
  drag?:
    | boolean
    | {
        icon?: IconProps['name']
      }
  style?: React.CSSProperties
  containerProps?: BoxProps
  label?: React.ReactNode
  layout?: Layout
  center?: boolean
  shadow?: boolean
}

function EditorPanel(
  props: React.PropsWithChildren<EditorPanelProps>,
  ref: React.RefObject<HTMLDivElement>,
) {
  const {
    className,
    center,
    containerProps,
    children,
    drag,
    label,
    layout,
    shadow,
    style,
    ...rest
  } = props

  const otherProps = {} as { 'data-grid'?: Layout }
  const otherStyleProps = {} as React.CSSProperties

  if (layout) otherProps['data-grid'] = layout

  if (center) {
    otherStyleProps.display = 'flex'
    otherStyleProps.justifyContent = 'center'
    otherStyleProps.alignItems = 'center'
  }

  if (shadow) {
    otherStyleProps.boxShadow = '0px 0px 15px rgba(0, 0, 0, 0.1)'
  }

  return (
    <Box
      ref={ref}
      {...containerProps}
      style={{ ...otherStyleProps, ...style }}
      className={className}
      key={rest.id || rest['key']}
      {...rest}
      {...otherProps}
    >
      {children}
    </Box>
  )
}

export default forwardRef<EditorPanelProps, 'div'>(EditorPanel as any)
