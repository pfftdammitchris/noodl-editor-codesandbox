import * as nt from 'noodl-types'
import { atom } from 'recoil'
import * as t from '../types'

/* -------------------------------------------------------
  ---- ACTIVES
-------------------------------------------------------- */

export interface ActivesState {
  componentId: string
  page: string
}

export const activesState = atom<ActivesState>({
  key: 'actives',
  default: {
    componentId: '',
    page: '',
  },
})

/* -------------------------------------------------------
  ---- PAGES
-------------------------------------------------------- */

export type PagesState = Record<
  string,
  {
    name: string
    components: t.BoardComponentSlot[]
  }
>

export const pagesState = atom({
  key: 'pages',
  default: { '': { name: '', components: [] } } as PagesState,
})

/* -------------------------------------------------------
  ---- ROOT
-------------------------------------------------------- */

export type RootState = Record<
  string,
  {
    components?: nt.ComponentObject[]
    Config?: nt.RootConfig
    Global?: Record<string, any>
    Style?: nt.StyleObject
  } & Record<string, any>
>

export const rootState = atom({
  key: 'root',
  default: {} as RootState,
})

/* -------------------------------------------------------
  ---- VIEWPORT
-------------------------------------------------------- */

export type ViewportState = { width: number; height: number }

export const viewportState = atom<ViewportState>({
  key: 'viewport',
  default: { width: 375, height: 667 },
})
