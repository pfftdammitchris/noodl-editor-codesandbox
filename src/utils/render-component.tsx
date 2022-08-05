import React from 'react'
import * as u from '@jsmanifest/utils'
import * as nt from 'noodl-types'
import createComponent from './create-component'
import nui, { normalizeProps } from './nui'
import * as t from '../types'

/**
 *
 * @param { nt.ComponentObject } noodlComponentObject - NOODL component object (unparsed)
 * @param { t.SelectOptionObject[] } options Select options
 * @returns { React.ReactElement }
 */
function renderComponent<T extends keyof JSX.IntrinsicElements>(
  noodlComponentObject: nt.ComponentObject,
  options: Partial<Parameters<typeof normalizeProps>[2]> = {},
) {
  const { root, viewport } = options
  const { type, style, ...rest }: t.NoodlElementObject = createComponent(
    noodlComponentObject,
    {
      assetsUrl: '/assets/',
      getBaseStyles: nui.getBaseStyles,
      viewport,
      root,
      ...options,
    },
  )

  const props = { style, ...rest } as {
    type: T
    children?: React.ReactNode
    style?: React.CSSProperties
  } & t.NoodlElement<T>

  /**
   * Rendering children
   */

  if (type === 'select') {
    props.children = u.reduce(
      u.array(rest.options || noodlComponentObject.options),
      (acc = [], option) =>
        u.isObj(option)
          ? acc.concat(<option value={option.value}>{option.label}</option>)
          : acc,
      [] as React.ReactElement<any, 'option'>[],
    )
  } else if (noodlComponentObject?.text) {
    props.children = rest?.text || ''
  } else if (noodlComponentObject?.children) {
    props.children = u.reduce(
      u.array(noodlComponentObject?.children),
      (acc, child: nt.ComponentObject) =>
        child ? acc.concat(renderComponent(child, options)) : acc,
      [] as React.ReactElement[],
    )
  }

  return React.createElement(type, props, props.children)
}

export default renderComponent
