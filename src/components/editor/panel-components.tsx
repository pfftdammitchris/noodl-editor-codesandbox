import React from 'react'
import { Box, BoxProps } from '@chakra-ui/react'
import { useDrag } from 'react-dnd'
import { ItemType } from '../../constants'

export interface ComponentsPanelProps extends BoxProps {}

function NoodlComponent({
  children,
  type,
  item,
}: React.PropsWithChildren<{ type: string; item: any; index: number }>) {
  const [collectedProps, drag] = useDrag({
    type: ItemType.BOARD_SLOT,
    collect: (monitor) => {
      const result = {
        dragging: monitor.isDragging(),
        canDrag: monitor.canDrag(),
        didDrop: monitor.didDrop(),
        type: monitor.getItemType(),
        result: monitor.getDropResult(),
      }
      return result
    },
    item,
  })

  return (
    <Box
      ref={drag}
      w="100%"
      h="50px"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      margin="3px auto"
      border="1px dashed #999"
      cursor="pointer"
    >
      {React.isValidElement(children)
        ? React.cloneElement(children, {
            ...children.props,
            style: {
              ...children.props?.style,
              pointerEvents: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: 'none',
              width: '100%',
              height: '100%',
              outline: 'none',
              ...(['select', 'textField'].includes(item?.child?.props?.id || '')
                ? { textAlignLast: 'center' }
                : undefined),
            },
            fontSize: 'sm',
          })
        : String(children)}
    </Box>
  )
}

function ComponentsPanel({ children, ...rest }: ComponentsPanelProps) {
  return (
    <Box
      display="flex"
      flexDir="column"
      justifyContent="center"
      w="full"
      {...rest}
    >
      {React.Children.toArray(children).map((child, index) => {
        if (React.isValidElement(child)) {
          const key = child.props?.id || child.key
          const item = { type: ItemType.COMPONENT, child, index, key }
          return (
            <NoodlComponent
              type={ItemType.COMPONENT}
              key={key}
              item={item}
              index={index}
            >
              {child}
            </NoodlComponent>
          )
        }
        return String(child)
      })}
    </Box>
  )
}

ComponentsPanel.whyDidYouRender = true

export default React.memo(ComponentsPanel, () => true)
