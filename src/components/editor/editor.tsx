import React from 'react'
import GridLayout, { ReactGridLayoutProps } from 'react-grid-layout'
import { isViewport, Viewport } from 'noodl-ui'
import { Provider } from './use-editor-context'
import nui from '../../utils/nui'
import type { BoardProps } from './board'
import * as t from '../../types'

export interface EditorProps extends ReactGridLayoutProps {
  assetsUrl?: string
  baseUrl?: string
  board?: BoardProps & {
    style?: React.CSSProperties
  }
  config?: string
  height?: number
  min?: number
  max?: number
  panels?: t.PanelOptions[]
  pageNames?: string[]
  preload?: string[]
  root?: Record<string, any>
  toolbar?: {
    actions?: boolean | {}
  }
  viewport?: Viewport | { width: number; height: number }
}

function Editor({
  assetsUrl = '',
  baseUrl = '',
  children: childrenProp,
  board,
  config = 'aitmed',
  isBounded = true,
  layout: layoutProp,
  min = 10,
  max = 10,
  onLayoutChange: onLayoutChangeProp,
  pageNames = [],
  preload = [],
  panels,
  root = {},
  rowHeight = 150,
  toolbar,
  width,
  height,
  viewport: viewportProp,
  ...rest
}: React.PropsWithChildren<EditorProps>) {
  const [layout, setLayout] = React.useState(layoutProp)

  const viewport = isViewport(viewportProp)
    ? viewportProp
    : new Viewport(viewportProp)

  const ctx: t.EditorContext = {
    assetsUrl,
    baseUrl,
    pages: pageNames,
    preload,
    root,
    viewport,
  }

  const onLayoutChange: ReactGridLayoutProps['onLayoutChange'] = React.useCallback(
    (layout) => {
      if (onLayoutChangeProp) onLayoutChangeProp(layout)
      else setLayout(layout)
    },
    [onLayoutChangeProp],
  )

  React.useEffect(() => {
    nui.use({
      getAssetsUrl: () => assetsUrl,
      getBaseUrl: () => baseUrl,
      getPages: () => pageNames,
      getPreloadPages: () => preload,
      getRoot: () => root,
    })
  }, [assetsUrl, baseUrl, preload, root, pageNames])

  let children = React.Children.toArray(childrenProp).map((child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, {
          ...child.props,
          key: child.props.id,
          id: child.props.id,
        })
      : String(child),
  )

  return (
    <Provider value={ctx}>
      <GridLayout
        compactType="vertical"
        containerPadding={[10, 10]}
        isBounded={isBounded}
        onLayoutChange={onLayoutChange}
        layout={layout}
        rowHeight={rowHeight}
        style={{ height }}
        width={width}
        cols={20}
        preventCollision
        verticalCompact
        {...rest}
      >
        {children}
      </GridLayout>
    </Provider>
  )
}

export default React.memo(Editor)
