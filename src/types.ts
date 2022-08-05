import React from 'react'
import * as nt from 'noodl-types'
import { useModal } from '@chakra-ui/react'
import { Layout } from 'react-grid-layout'
import { initialState as initialAppState } from './App'
import { tagNameMap } from './utils/create-component'
import nui, { Viewport as NuiViewport } from './utils/nui'

export type AppState = typeof initialAppState

export interface AppContext extends AppState {
  nui: typeof nui
  cache: typeof nui.cache
  modal: ReturnType<typeof useModal>
}

export type Breakpoint = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

export interface BoardComponentSlot {
  id: string
  component: Partial<nt.ComponentObject>
}

export interface EditorContext {
  assetsUrl: string
  baseUrl: string
  pages: string[]
  preload: string[]
  root: Record<string, any>
  viewport: NuiViewport
}

export type NoodlElement<
  T extends keyof JSX.IntrinsicElements
> = JSX.IntrinsicElements[T]

export type NoodlComponentElementMap<
  T extends keyof typeof tagNameMap
> = NoodlElement<typeof tagNameMap[T]>

export type NoodlElementObject<
  T extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap
> = {
  type: T
  style?: React.CSSProperties
  children?: NoodlElementObject | NoodlElementObject[] | null
  className?: string
  options?: SelectOptionObject[]
  placeholder?: string
  src?: string
  text?: string
}

export type Position = 'top' | 'right' | 'bottom' | 'left' | 'center'

export interface PanelOptions<Props = any> {
  name?: string
  component?: React.ElementType<Props>
  props?: Props
  layout?: Layout
}

export interface SelectOptionObject {
  label?: string | number
  value?: any
}

export type ToolbarComponentType = 'button' | 'input'

export interface ToolbarItem {
  name?: string
  id?: string
  component?: React.ReactNode | nt.ComponentObject
  type?: ToolbarComponentType
  containerProps?: {
    id?: string
    width?: number
  }
  description?: string
  position?: 'left' | 'center' | 'right'
  icon?: string
  disabled?: boolean
  onClick?(evt?: React.MouseEvent): void
  width?: number
}

/* -------------------------------------------------------
  ---- CONFIGURATION TOOL TYPES
-------------------------------------------------------- */

export interface BaseConfiguration {
  id?: string
}

export interface BaseComponentConfiguration extends BaseConfiguration {
  width?: number
  height?: number
  title?: string
  // fontSize?: number
}

export interface ButtonComponentConfiguration
  extends BaseComponentConfiguration {
  text?: string
}

export interface ImageComponentConfiguration
  extends BaseComponentConfiguration {
  alt?: string
  src?: string
}

export interface SelectComponentConfiguration
  extends BaseComponentConfiguration {
  options?: any[]
  disabled?: boolean
  defaultValue?: any
}

export interface TextFieldComponentConfiguration
  extends BaseComponentConfiguration {
  dataKey?: string
  placeholder?: string
  disabled?: boolean
  defaultValue?: any
}

export interface ViewComponentConfiguration
  extends BaseComponentConfiguration {}

/* -------------------------------------------------------
  ---- UTILITIES
-------------------------------------------------------- */

export type OrArray<V> = V | V[]
