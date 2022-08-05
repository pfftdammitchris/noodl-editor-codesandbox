import React from 'react'
import * as u from '@jsmanifest/utils'
import produce, { Draft } from 'immer'
import { useRecoilValue } from 'recoil'
import { Layout } from 'react-grid-layout'
import { pagesState, PagesState } from '../store/atoms'

const KEY = `editor`

export interface Options extends Partial<Pick<State, 'board'>> {
  currentPage?: string
  layout?: Layout[]
  delay?: number
  pages?: PagesState
}

export type State = typeof initialState

const initialState = {
  currentPage: '',
  layout: [] as Layout[],
  board: {},
}

export function getStateFromLocalStorage() {
  const cachedState = localStorage.getItem(KEY)
  return cachedState ? (JSON.parse(cachedState) as Partial<State>) : {}
}

function useEditorLocalStorage({
  currentPage,
  board,
  delay = 5000,
  layout,
}: Options = {}) {
  const [state, setState] = React.useState(initialState)
  const pages = useRecoilValue(pagesState)

  const set = React.useCallback(
    (
      stateOrUpdater: Partial<State> | ((state: Draft<Partial<State>>) => void),
    ) => {
      setState(
        produce((draft) => {
          if (u.isFnc(stateOrUpdater)) {
            stateOrUpdater(draft)
          } else if (u.isObj(stateOrUpdater)) {
            for (const [key, value] of u.entries(stateOrUpdater)) {
              draft[key as any] = value
            }
          }
        }),
      )
    },
    [],
  )

  const save = React.useCallback(
    (stateToSave: Partial<State> = state) => {
      localStorage.setItem(KEY, JSON.stringify(stateToSave, null, 2))
    },
    [state],
  )

  React.useEffect(() => {
    u.isStr(currentPage) && set({ currentPage })
  }, [currentPage])

  React.useEffect(() => {
    layout && set({ layout })
  }, [layout])

  return {
    getStateFromLocalStorage,
    save,
  }
}

export default useEditorLocalStorage
