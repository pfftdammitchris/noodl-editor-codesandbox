import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import React from 'react'
import produce, { current, Draft, isDraft } from 'immer'
import { getRandomKey } from '../utils/common'
import { revert } from '../utils/nui'
import { BoardComponentSlot } from '../types'

export type State = typeof initialState

const initialState = {
  components: [] as BoardComponentSlot[],
}

export function getDefaultProps(type: nt.ComponentType) {
  const props = {
    type,
    style: { left: '0', width: '0.2' },
  } as Record<string, any>

  if (type === 'button') {
    props.text = 'Button'
  } else if (nt.Identify.component.listLike(props)) {
    props.listObject = [{ value: 'Hello' }]
    props.contentType = 'listObject'
    props.iteratorVar = 'itemObject'
    props.children = [
      {
        type: 'listItem',
        [props.iteratorVar]: '',
        children: [{ type: 'label', dataKey: `${props.iteratorVar}.value` }],
      },
    ]
  } else if (type === 'listItem') {
    props.itemObject = ''
  } else if (type === 'ecosDoc') {
    props.ecosObj = { name: {} }
  } else if (type === 'image') {
    props.path = 'logo.png'
    props.style.objectFit = 'contain'
    props.style.height = '0.1'
  } else if (type === 'page') {
    props.path = ''
  } else if (
    ['plugin', 'pluginHead', 'pluginBodyTop', 'pluginBodyTail'].some(
      (pluginType) => pluginType === type,
    )
  ) {
    props.path = ''
  } else if (type === 'popUp') {
    props.popUpView = ''
  } else if (type === 'register') {
    props.onEvent = ''
  } else if (type === 'select') {
    props.options = ['Option 1', 'Option 2', 'Option 3']
  } else if (type === 'textField') {
    props.dataKey = ''
    props.placeholder = 'Enter input'
  } else if (type === 'textView') {
    props.isEditable = true
  } else if (type === 'video') {
    props.path = ''
    props.objectFit = 'contain'
  } else if (type === 'view') {
    props.style.height = '0.1'
  }

  return props
}

export function toNoodl(
  components:
    | nt.ComponentObject
    | BoardComponentSlot
    | (nt.ComponentObject | BoardComponentSlot)[],
  options,
) {
  return u.array(components).map((comp) => {
    const component = 'component' in comp ? comp.component : comp
    return revert(isDraft(component) ? current(component) : component, options)
  })
}

export function toComponentSlot(
  comp: nt.ComponentObject | BoardComponentSlot,
): BoardComponentSlot {
  if ('component' in comp) return comp as BoardComponentSlot
  const id = comp.id || getRandomKey()
  return { id, component: comp }
}

function useEditorComponents() {
  const [state, setState] = React.useState(initialState)

  const updateState = React.useCallback(
    (stateOrUpdater: Partial<State> | ((prevState: State) => void)) => {
      setState(
        produce((draft) => {
          if (u.isFnc(stateOrUpdater)) {
            stateOrUpdater(draft)
          } else if (u.isObj(stateOrUpdater)) {
            for (const [key, value] of u.entries(stateOrUpdater)) {
              draft[key] = value
            }
          }
        }),
      )
    },
    [],
  )

  const add = React.useCallback(
    (component: nt.ComponentObject | BoardComponentSlot) => {
      const slot = toComponentSlot(component)
      updateState((draft) => {
        if ('component' in component) {
          if (component.id) {
            if (draft.components.some((comp) => comp.id === component.id)) {
              return
            }
          }
        }
        draft.components.push(slot)
      })
      return slot
    },
    [],
  )

  const set = React.useCallback(
    (components: nt.ComponentObject[] | BoardComponentSlot[]) => {
      updateState({ components: components.map(toComponentSlot) })
    },
    [],
  )

  const update = React.useCallback(
    (slot: Partial<BoardComponentSlot> | ((draft: Draft<State>) => void)) => {
      updateState((draft) => {
        if (u.isFnc(slot)) {
          slot(draft)
        } else {
          const stateSlot = draft.components.find((obj) => obj.id === slot.id)
          if (stateSlot) {
            for (const [key, value] of u.entries(
              slot.component as BoardComponentSlot['component'],
            )) {
              if (key === 'style') {
                if (u.isObj(value)) {
                  for (const [k, v] of u.entries(value)) {
                    if (stateSlot.component.style) {
                      stateSlot.component.style[k] = v
                    }
                  }
                }
              } else {
                stateSlot.component[key] = value
              }
            }
          }
        }
      })
      return slot
    },
    [],
  )

  const remove = React.useCallback((id: string) => {
    updateState((draft) => {
      const index = draft.components.findIndex((obj) => obj.id === id)
      if (index > -1) draft.components.splice(index, 1)
    })
  }, [])

  return {
    ...state,
    add,
    set,
    remove,
    update,
    getDefaultProps,
    toNoodl,
    toComponentSlot,
  }
}

export default useEditorComponents
