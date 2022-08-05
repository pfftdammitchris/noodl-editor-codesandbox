import React from 'react'
import * as nt from 'noodl-types'
import { useRecoilValue } from 'recoil'
import { Box, BoxProps, forwardRef } from '@chakra-ui/react'
import { useDrop, DropTargetHookSpec } from 'react-dnd'
import { pagesState, rootState, viewportState } from '../../store/atoms'
import renderComponent from '../../utils/render-component'
import { SlotProps } from './board-slot'
import { ItemType } from '../../constants'
import BoardComponentSlotComponent, {
  BoardComponentSlotProps,
} from './board-component-slot'
import * as t from '../../types'

export type DropSpec = DropTargetHookSpec<unknown, unknown, unknown>

export type BoardProps = Omit<BoxProps, 'onChange'> & {
  components?: t.BoardComponentSlot[]
  findComponentById: BoardComponentSlotProps['findComponentById']
  page?: string
  onClick?: SlotProps['onClick']
  onDrop?: DropSpec['drop']
  onResize?: SlotProps['onResize']
  onResizeStop?: SlotProps['onResizeStop']
}

function Board(
  props: React.PropsWithChildren<BoardProps>,
  ref: React.RefObject<HTMLDivElement>,
) {
  const pages = useRecoilValue(pagesState)
  const root = useRecoilValue(rootState)
  const viewport = useRecoilValue(viewportState)

  const {
    findComponentById,
    page = '',
    onClick,
    onDrop,
    onResize: onResizeProp,
    onResizeStop: onResizeStopProp,
    ...rest
  } = props

  const components = pages[page]?.components || []

  const [collectedProps, drop] = useDrop(
    {
      accept: ItemType.BOARD_SLOT,
      canDrop: () => true,
      collect: (monitor) => {},
      drop: onDrop,
    },
    [components],
  )

  const parseComponent = React.useCallback(
    (component: nt.ComponentObject) =>
      renderComponent(component, { root, viewport }),
    [components, root, viewport],
  )

  const children = components.map((slot, index) => (
    <BoardComponentSlotComponent
      key={slot.id}
      findComponentById={findComponentById}
      index={index}
      slot={slot}
      onClick={onClick}
      onResize={onResizeProp}
      onResizeStop={onResizeStopProp}
      root={root}
      viewport={viewport}
    >
      {parseComponent(slot.component as nt.ComponentObject)}
    </BoardComponentSlotComponent>
  ))

  drop(ref)

  return (
    <Box
      ref={ref}
      width={`${viewport?.width || 0}px`}
      height={`${viewport?.height || 0}px`}
      position="relative"
      {...rest}
    >
      {children}
    </Box>
  )
}

Board.whyDidYouRender = true

export default forwardRef<BoardProps, 'div'>(Board as any)
