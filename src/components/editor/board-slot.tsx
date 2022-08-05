import React from 'react'
import * as u from '@jsmanifest/utils'
import {
  Resizable,
  ResizeCallback,
  ResizeDirection,
  ResizeStartCallback,
  ResizableProps,
  NumberSize,
} from 're-resizable'
import { Box, BoxProps } from '@chakra-ui/react'
import { useDrag } from 'react-dnd'
import { ItemType } from '../../constants'

export interface SlotProps<Item = any>
  extends Omit<ResizableProps, 'onResize' | 'onResizeStart' | 'onResizeStop'> {
  defaultWidth?: string | number
  defaultHeight?: string | number
  width?: number
  height?: number
  id: string
  item?: any
  onClick?(args: {
    event: React.MouseEvent<HTMLDivElement>
    id: string
    item?: Item
    ref: React.RefObject<HTMLDivElement>
  }): void
  onResize?(args: {
    item: Item
    id: string
    event: Parameters<ResizeCallback>[0]
    direction: ResizeDirection
    ref: Parameters<ResizeCallback>[2]
    width: number
    height: number
  }): void
  onResizeStart?(args: {
    item: Item
    id: string
    event: Parameters<ResizeStartCallback>[0]
    direction: ResizeDirection
    ref: Parameters<ResizeStartCallback>[2]
  }): void
  onResizeStop?(args: {
    item: Item
    id: string
    event: Parameters<ResizeCallback>[0]
    direction: ResizeDirection
    ref: Parameters<ResizeCallback>[2]
    width: NumberSize['width']
    height: NumberSize['height']
  }): void
}

function BoardSlot({
  children: childrenProp = null,
  id,
  item,
  defaultWidth,
  defaultHeight,
  width: widthProp,
  height: heightProp,
  onClick: onClickProp,
  onResize: onResizeProp,
  onResizeStart: onResizeStartProp,
  onResizeStop: onResizeStopProp,
  style,
  ...rest
}: React.PropsWithChildren<SlotProps>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [resizing, setResizing] = React.useState(false)
  const [width, setWidth] = React.useState<any>(defaultWidth || widthProp)
  const [height, setHeight] = React.useState<any>(defaultHeight || heightProp)
  const [{ dragging }, drag, preview] = useDrag(
    () => ({
      type: ItemType.BOARD_SLOT,
      item,
      collect: (monitor) => {
        return { dragging: monitor.isDragging(), ref }
      },
      canDrag: () => !resizing,
      options: {
        dropEffect: 'move',
      },
    }),
    [resizing],
  )

  const onClick = React.useCallback(
    ({ id, item }: Pick<SlotProps, 'id' | 'item'>): BoxProps['onClick'] => (
      event,
    ) => {
      onClickProp?.({ id, item, event, ref })
    },
    [],
  )

  const onResizeStart: ResizeStartCallback = React.useCallback(
    (event, direction, ref) => {
      setResizing(true)
      onResizeStartProp?.({ id, item, event, direction, ref })
    },
    [id, item, onResizeStartProp],
  )

  const onResizeStop: ResizeCallback = React.useCallback(
    (event, direction, ref, delta) => {
      setResizing(false)
      onResizeStopProp?.({
        id,
        item,
        event,
        direction,
        ref,
        ...delta,
      })
    },
    [id, item],
  )

  const onResize: ResizeCallback = React.useCallback(
    (event, direction, ref, delta) => {
      if (u.isFnc(onResizeProp)) {
        onResizeProp({ direction, event, id, item, ref, ...delta })
      } else {
        setWidth(delta.width)
        setHeight(delta.height)
      }
    },
    [id, item],
  )

  React.useEffect(() => {
    setWidth(widthProp)
  }, [widthProp])

  React.useEffect(() => {
    setWidth(heightProp)
  }, [heightProp])

  const isValidElement = React.isValidElement(childrenProp)

  const styles = {
    ...(isValidElement ? childrenProp.props.style : undefined),
    width,
    height,
  }

  if (dragging) {
    styles.borderColor = '#791EE0'
    styles.borderStyle = 'dashed'
    styles.borderWidth = '1px'
  }

  const children = isValidElement
    ? React.cloneElement(childrenProp, {
        ...childrenProp.props,
        style: {
          width: '100%',
          height: '100%',
        },
      })
    : childrenProp || null

  drag(ref)

  return (
    <Box onClick={onClick({ id, item })} ref={ref}>
      <Resizable
        bounds="parent"
        enable={{
          top: false,
          topRight: false,
          topLeft: false,
          right: false,
          bottom: false,
          bottomRight: true,
          bottomLeft: false,
          left: false,
        }}
        onResize={onResize}
        onResizeStart={onResizeStart}
        onResizeStop={onResizeStop}
        handleComponent={{
          bottomRight: (
            <img
              style={{ zIndex: 99999 }}
              width={10}
              height={10}
              src="/assets/dragger.png"
            />
          ),
        }}
        style={styles}
        {...rest}
      >
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              ref: preview,
              style: {
                ...(children as React.ReactElement)?.props?.style,
                border: '1px dashed deepskyblue',
              },
            })
          : children || null}
      </Resizable>
    </Box>
  )
}

// BoardSlot.whyDidYouRender = true

export default BoardSlot
