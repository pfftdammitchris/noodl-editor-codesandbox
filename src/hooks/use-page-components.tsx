import React from 'react'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import set from 'lodash/set'
import produce, { Draft } from 'immer'
import { useRecoilState } from 'recoil'
import { pagesState, PagesState } from '../store/atoms'
import toComponentSlot from '../utils/to-component-slot'
import * as t from '../types'

function findComponent(
  state: PagesState,
  page: string,
  id: string,
): t.BoardComponentSlot

function findComponent(
  draft: Draft<PagesState>,
  page: string,
  id: string,
): Draft<t.BoardComponentSlot>

function findComponent(
  draft: PagesState | Draft<PagesState>,
  page: string,
  id: string,
) {
  return draft[page]?.components?.find?.((obj) => obj.id === id)
}

function usePageComponents(page: string) {
  const [pages, setPages] = useRecoilState(pagesState)

  const components = React.useMemo(() => pages[page]?.components || [], [
    page,
    pages,
  ])

  const findComponentById = React.useCallback(
    (id: string) => {
      return pages[page]?.components?.find?.((obj) => obj.id === id) || null
    },
    [page, pages],
  )

  const addComponent = React.useCallback(
    (component: nt.ComponentObject | t.BoardComponentSlot) => {
      const slot = toComponentSlot(component)
      setPages(
        produce((draft) => {
          !draft[page] && (draft[page] = { name: page, components: [] })
          draft[page].components.push(slot)
        }),
      )
      return slot
    },
    [page],
  )

  const removeComponent = React.useCallback((id: string) => {
    setPages(
      produce((draft) => {
        const index = draft[page]?.components?.findIndex?.(
          (obj) => obj.id === id,
        )
        index > 1 && draft[page].components.splice(index, 1)
      }),
    )
    return id
  }, [])

  const updateComponent = React.useCallback(
    (
      optionsOrUpdater:
        | ((draft: Draft<PagesState>) => void)
        | {
            id: string
            page?: string
            props: Record<string, any>
          },
    ) => {
      setPages(
        produce((draft) => {
          if (u.isFnc(optionsOrUpdater)) {
            optionsOrUpdater(draft)
          } else {
            const { id, page: pageName = page, props } = optionsOrUpdater
            const slot = findComponent(draft, pageName, id)
            if (slot) {
              if (!pages[page].components.some((o) => o.id === id)) {
                pages[page].components.push({ ...slot })
              }
              for (const [key, value] of u.entries(props)) {
                if (key.startsWith('style')) {
                  set(slot.component, key, value)
                } else {
                  slot[key] = value
                }
              }
            } else {
              console.log(
                `%c[updateComponent] Could not find a component slot in state with id "${id}"`,
                `color:#ec0000;`,
                { id, page: pageName, props },
              )
            }
          }
        }),
      )
    },
    [page],
  )

  return {
    components,
    addComponent,
    findComponent,
    findComponentById,
    removeComponent,
    updateComponent,
  }
}

export default usePageComponents
