import { Layout } from 'react-grid-layout'
import { Viewport as NuiViewport } from './utils/nui'

export function getDefaultLayout(
  viewport: { width: number; height: number } | NuiViewport,
): Layout[] {
  return [
    {
      i: 'pages',
      w: 3,
      h: 0.4,
      x: 0,
      y: 0,
      minH: 0.4,
      maxH: 0.4,
      isDraggable: false,
      static: true,
    },
    {
      i: 'components',
      w: 3,
      h: 4,
      x: 0,
      y: 0.4,
      isDraggable: false,
      static: true,
    },
    {
      i: 'page-settings',
      w: 10,
      h: 0.4,
      x: 3,
      y: 0,
      minH: 0.4,
      isDraggable: false,
      static: true,
    },
    {
      i: 'toolbar',
      w: 7,
      h: 0.4,
      x: 13,
      y: 0,
      minH: 0.4,
      isDraggable: false,
      static: true,
    },
    {
      i: 'board',
      w: 10,
      h: 4.5,
      x: 3,
      y: 0.4,
      minH: 4,
      maxH: 4.5,
      static: true,
    },
    {
      i: 'configuration-tools',
      w: 7,
      h: 4,
      x: 13,
      y: 0.4,
      minH: 1,
      static: true,
    },
  ]
}
