import React from 'react'
import * as u from '@jsmanifest/utils'
import { Box, BoxProps } from '@chakra-ui/react'
import ToolbarComponent from './toolbar-component'
import * as t from '../../types'

export interface ToolbarProps extends BoxProps {
  components?: t.ToolbarItem[]
  classes?: {
    toolbarComponent?: string
  }
}

function Toolbar({ classes, components = [], ...rest }: ToolbarProps) {
  const left = [] as { containerProps?: any; component: React.ReactNode }[]
  const center = [] as { containerProps?: any; component: React.ReactNode }[]
  const right = [] as { containerProps?: any; component: React.ReactNode }[]

  for (const obj of components) {
    let component: React.ReactNode
    let containerProps = {} as any

    const {
      type,
      id,
      icon,
      name,
      onClick,
      position = 'center',
      containerProps: consumerContainerProps,
      description,
      width,
      disabled,
      ...rest
    } = obj

    if (onClick) {
      containerProps.onClick = onClick
    }

    if (disabled) {
      containerProps.disabled = true
    }

    if (obj.component) {
      const elementProps = {
        ...obj.component?.props,
        style: { width, ...obj.component?.style },
      } as any

      component = React.cloneElement(obj.component, elementProps)
    } else {
      const props = { style: {} } as any

      if (icon) {
        if (type === 'button') {
          containerProps.src = icon
        } else if (type === 'input') {
          //
        }
      }

      if (description) {
        containerProps.title = description
      }

      if (consumerContainerProps?.width) {
        containerProps.width = consumerContainerProps?.width
      }

      if (!u.isUnd(consumerContainerProps?.id)) {
        containerProps.id = consumerContainerProps?.id
      }

      component = React.createElement(type as any, {
        ...rest,
        id,
        name,
        ...props,
        style: { width, ...props?.style },
      })
    }

    if (position === 'left') left.push({ containerProps, component })
    else if (position === 'center') center.push({ containerProps, component })
    else if (position === 'right') right.push({ containerProps, component })
  }

  const renderComponents = React.useCallback(
    (components: { containerProps?: any; component: React.ReactNode }[]) => {
      return components.map(({ containerProps, component }, index) => (
        <React.Fragment key={index}>
          <Toolbar.Component
            className={classes?.toolbarComponent}
            {...containerProps}
          >
            {component}
          </Toolbar.Component>
          {index < components.length - 1 ? (
            <span style={{ width: 10 }} />
          ) : null}
        </React.Fragment>
      ))
    },
    [],
  )

  const commonBoxProps = {
    w: 'full',
    h: 'full',
    display: 'flex',
    alignItems: 'center',
  }

  return (
    <Box justifyContent="space-between" p={1} {...commonBoxProps} {...rest}>
      <Box {...commonBoxProps}>{renderComponents(left)}</Box>
      <Box {...commonBoxProps}>{renderComponents(center)}</Box>
      <Box justifyContent="flex-end" {...commonBoxProps}>
        {renderComponents(right)}
      </Box>
    </Box>
  )
}

Toolbar.Component = ToolbarComponent
Toolbar.whyDidYouRender = true

export default React.memo(Toolbar)
