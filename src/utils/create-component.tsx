import React from 'react'
import type { LiteralUnion } from 'type-fest'
import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import { getBaseStyles, normalizeProps } from './nui'
import * as t from '../types'

export const tagNameMap = {
  br: 'br',
  button: 'button',
  canvas: 'canvas',
  chart: 'div',
  date: 'input',
  dateSelect: 'input',
  divider: 'hr',
  ecosDoc: 'div',
  footer: 'div',
  header: 'div',
  searchBar: 'input',
  textField: 'input',
  image: 'img',
  label: 'div',
  list: 'ul',
  listItem: 'li',
  map: 'div',
  page: 'iframe',
  popUp: 'div',
  plugin: 'div',
  pluginHead: 'script',
  pluginBodyTail: 'script',
  register: 'div',
  scrollView: 'div',
  select: 'select',
  textView: 'textarea',
  video: 'video',
  view: 'div',
} as const

function transform<T extends keyof HTMLElementTagNameMap = 'div'>({
  component,
  props,
  ...options
}: Parameters<typeof normalizeProps>[2] & {
  component: LiteralUnion<nt.ComponentType, string> | nt.ComponentObject
  props?: Record<string, any>
}) {
  let elementType: typeof tagNameMap[keyof typeof tagNameMap]
  let rest = normalizeProps(
    {},
    u.isStr(component)
      ? { ...props, type: component }
      : { ...component, ...props },
    { getBaseStyles, ...options },
  ) as {
    type: T
    style: Partial<React.CSSProperties>
    children?: any
  } & Record<string, any>

  if (u.isStr(component)) {
    elementType = tagNameMap[component] || tagNameMap.view
  } else {
    elementType = tagNameMap[component?.type] || tagNameMap.view
  }

  return [elementType, rest] as const
}

const reversibleDataAttribs = [
  'placeholder',
  'src',
  {
    key: 'options',
    replacer: (items: string | null | undefined | any[]) => {
      if (u.isStr(items) || u.isNum(items)) return []
      if (u.isArr(items)) {
        return items.map((item, index) => {
          let option: t.SelectOptionObject

          if (u.isStr(item) || u.isNum(item)) {
            option = { label: item, value: item }
          } else if (u.isObj(item)) {
            option = item
          } else {
            option = { label: String(item), value: item }
          }

          return option
        })
      }
      return u.array(items)
    },
  },
]

function createComponent<C extends nt.ComponentObject = nt.ComponentObject>(
  args: LiteralUnion<nt.ComponentType, string> | nt.ComponentObject,
  {
    container,
    props: propsProp,
    ...options
  }: Partial<Parameters<typeof normalizeProps>[2]> & {
    container?: React.ReactElement<any>
    props?: Partial<nt.ComponentObject>
  } = {},
): t.NoodlElementObject {
  let componentType: C['type'] = u.isStr(args) ? args : args?.type
  let [type, { style, children, ...rest }] = transform({
    component: u.isStr(args) ? { type: componentType } : args,
    props: propsProp,
    ...options,
  })
  let props = { ...rest, type, style, children } as t.NoodlElementObject

  // props['data-src'] ---> props.src
  for (const item of reversibleDataAttribs) {
    let key = u.isStr(item) ? item : item?.key || ''
    let replacer =
      u.isObj(item) && u.isFnc(item.replacer) ? item.replacer : undefined

    if (`data-${key}` in props || key in props) {
      const prevalue = props[`data-${key}`] || props[key]
      props[key] = u.isFnc(replacer) ? replacer(prevalue) : prevalue
      delete props[`data-${key}`]
    }
  }

  if (props['data-value'] && props['data-key']) {
    // console.log("props[\\'data-value\\']", props['data-value'])
    // props.children = React.createElement('div', String(props['data-value']))
  }

  if (!u.isStr(props.className)) props.className = ''

  if (props.className === '') {
    props.className += `noodl-${componentType}`
  } else {
    props.className += ` noodl-${componentType}`
  }

  return props
}

export default createComponent
