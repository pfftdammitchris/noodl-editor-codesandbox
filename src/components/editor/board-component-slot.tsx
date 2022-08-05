import React, { PropsWithChildren } from 'react'
import * as u from '@jsmanifest/utils'
import type { RootState, ViewportState } from '../../store/atoms'
import usePageComponents from '../../hooks/use-page-components'
import { normalizeProps } from '../../utils/nui'
import * as t from '../../types'
import Slot, { SlotProps } from './board-slot'

export interface BoardComponentSlotProps extends Omit<SlotProps, 'id'> {
  findComponentById: ReturnType<typeof usePageComponents>['findComponentById']
  slot: t.BoardComponentSlot
  onResize?: SlotProps['onResize']
  onResizeStop?: SlotProps['onResizeStop']
  // Props below are just used for memoization
  index?: number
  root?: RootState
  viewport: ViewportState
}

function BoardComponentSlot({
  children,
  findComponentById,
  slot,
  onResize,
  onResizeStop,
  root,
  viewport,
  ...rest
}: PropsWithChildren<BoardComponentSlotProps>) {
  const componentSlot = React.useMemo(() => findComponentById(slot.id), [slot])

  const getSize = (key: 'width' | 'height', slot: t.BoardComponentSlot) => {
    if (u.isObj(slot.component?.style)) {
      return Number(
        String(
          normalizeProps([key, slot.component.style[key]], { root, viewport }),
        ).replace('px', ''),
      )
    }
  }

  return React.isValidElement(children) ? (
    <Slot
      key={slot.id}
      item={componentSlot}
      defaultSize={{
        width: children.props.style?.width,
        height: children.props.style?.height,
      }}
      onResize={onResize}
      onResizeStop={onResizeStop}
      style={children.props.style}
      width={getSize('width', slot)}
      height={getSize('height', slot)}
      {...rest}
      id={slot.id}
    >
      {children}
    </Slot>
  ) : null
}

const memoizeStyleKeys = ['top', 'left', 'width', 'height', 'marginTop']
const numMemoizeKeys = memoizeStyleKeys.length

// BoardComponentSlot.whyDidYouRender = true

// export default React.memo(
//   BoardComponentSlot,
//   function isEqual(props, nextProps) {
//     if (props.id !== nextProps.id) return false
//     if (props.index !== nextProps.index) return false
//     if (props.slot?.id !== nextProps.slot?.id) return false
//     if (props.slot?.component?.type !== nextProps.slot?.component?.type) {
//       return false
//     }

//     for (let index = 0; index < numMemoizeKeys; index++) {
//       const styleKey = memoizeStyleKeys[index]
//       if (
//         props.slot?.component?.style?.[styleKey] !==
//         nextProps.slot?.component?.style?.[styleKey]
//       ) {
//         return false
//       }
//     }

//     return true
//   },
// )

export default BoardComponentSlot
