import { selector } from 'recoil'
import { activesState, pagesState } from './atoms'

export const selectActiveComponentId = selector({
  key: 'select-active-component-id',
  get: ({ get }) => get(activesState).componentId,
})

export const selectActivePage = selector({
  key: 'select-active-component-page',
  get: ({ get }) => get(activesState).page,
})

export const selectActivePageComponents = selector({
  key: 'select-active-page-components',
  get: ({ get }) => {
    const page = get(selectActivePage)
    const pages = get(pagesState)
    return pages[page]?.components
  },
})

export const selectActiveComponent = selector({
  key: 'select-active-page-components',
  get: ({ get }) => {
    const page = get(selectActivePage)
    const pages = get(pagesState)
    return pages[page]?.components
  },
})
