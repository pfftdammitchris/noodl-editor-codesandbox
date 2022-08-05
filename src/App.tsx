import React from 'react'
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import * as nt from 'noodl-types'
import * as u from '@jsmanifest/utils'
import { Layout } from 'react-grid-layout'
import {
  Box,
  Button,
  Image,
  Input,
  InputProps,
  Select,
  useDisclosure,
  useModal,
} from '@chakra-ui/react'
import { DragSourceMonitor } from 'react-dnd'
import yaml from 'yaml'
import { activesState, viewportState } from './store/atoms'
import {
  Editor,
  Board as BoardComponent,
  ComponentsPanel,
  ComponentConfigurationPanel,
  Panel,
  Toolbar,
  ToolbarProps,
  SlotProps,
} from './components/editor'
import Modal from './components/modal'
import nui, { revert } from './utils/nui'
import { getDefaultProps, toNoodl } from './hooks/use-editor-components'
import { toYML } from './utils/yaml'
import useEditorLocalStorage, {
  getStateFromLocalStorage,
} from './hooks/use-editor-local-storage'
import usePageComponents from './hooks/use-page-components'
import { Provider as NuiProvider } from './use-nui-context'
import { getDefaultLayout } from './layout'
import * as t from './types'

export const initialState = {
  active: {
    componentId: '',
  },
  assetsUrl: '',
  baseUrl: '',
  pages: [] as string[],
  preload: [] as string[],
}

function ToolbarPageInput({
  defaultValue = '',
  onChange: onChangeProp,
  onSubmit,
  ...props
}: Omit<InputProps, 'onChange' | 'onSubmit'> & {
  onChange?(
    evt: Parameters<NonNullable<InputProps['onChange']>>[0],
    ref: React.MutableRefObject<HTMLInputElement>['current'],
  ): void
  onSubmit?(
    page: string,
    ref: React.MutableRefObject<HTMLInputElement>['current'],
  ): void
}) {
  const ref = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState(defaultValue)

  const onChange: InputProps['onChange'] = React.useCallback(
    (evt) => {
      setValue(evt.target.value)
      onChangeProp?.(evt, ref.current as HTMLInputElement)
    },
    [onChangeProp],
  )

  const onKeyPress: InputProps['onKeyPress'] = React.useCallback((evt) => {
    if (evt.charCode == '13') {
      onSubmit?.(evt.target.value, ref.current as HTMLInputElement)
    }
  }, [])

  return (
    <Input
      ref={ref}
      {...props}
      style={{ background: 'none', ...props?.style }}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
    />
  )
}

function App() {
  const cachedState = getStateFromLocalStorage()
  const [state, setState] = React.useState(initialState)
  const [actives, setActives] = useRecoilState(activesState)
  const { onOpen, isOpen, onClose } = useDisclosure({
    defaultIsOpen: false,
  })
  const modal = useModal({ isOpen, onClose })
  const viewport = useRecoilValue(viewportState)
  const [layout, setLayout] = React.useState<Layout[]>(
    cachedState.layout || getDefaultLayout(viewport),
  )
  const boardRef = React.useRef<HTMLDivElement>()
  // const modalRef = React.useRef<any>()

  const {
    components,
    addComponent,
    removeComponent,
    updateComponent,
    findComponent,
    findComponentById,
  } = usePageComponents(actives.page)

  const { save: saveStateToLocalStorage } = useEditorLocalStorage({
    currentPage: actives.page,
    layout: layout || getDefaultLayout(viewport),
    delay: 3000,
  })

  const ctx: t.AppContext = {
    ...state,
    assetsUrl: '/assets/',
    baseUrl: '/',
    cache: nui.cache,
    modal,
    nui,
    pages: [],
    preload: [],
  }

  const onDrop = React.useCallback(
    (
      item:
        | t.BoardComponentSlot
        | {
            child: React.ReactElement
            index: number
            key: string | number
            type: string
          },
      monitor: DragSourceMonitor,
    ) => {
      let clientOffset = monitor.getClientOffset()
      let isShifting = false
      let componentType = '' as nt.ComponentType
      let defaultProps: ReturnType<typeof getDefaultProps> | undefined
      let id = ''

      // Item is coming from ComponentsPanel (fresh/new)
      if (!('component' in item) && React.isValidElement(item.child)) {
        const child = item.child as React.ReactElement
        componentType = child.props?.id
        id = child.props?.id || item.child?.key || item?.key || ''
      }
      // (in this case it is being dragged from one location to another while it is already a slot of the board
      else if ('component' in item) {
        componentType = item.component?.type
        id = item.id
        isShifting = true
      }

      if (componentType) {
        defaultProps = getDefaultProps(componentType as nt.ComponentType)
      }

      const makeTopLeftFn = function (dir: 'top' | 'left') {
        return function (offset = 0) {
          const axis = dir === 'top' ? 'y' : 'x'
          const boardBounds = boardRef.current?.getBoundingClientRect()
          const startPos = boardBounds?.[axis] as number
          return revert([dir, `${offset - startPos}px`], {
            root: {},
            viewport,
          })
        }
      }

      const getTop = makeTopLeftFn('top')
      const getLeft = makeTopLeftFn('left')

      const style = {
        // border: { style: '4', width: 'thin', color: 'deepskyblue' },
        ...defaultProps?.style,
        top: getTop(clientOffset?.y),
        left: getLeft(clientOffset?.x),
      }

      let component = { type: componentType, ...defaultProps, style }

      if (isShifting) {
        console.log(`%c[Shifting component]`, `color:#95a5a6;`, component)
        updateComponent({ id, page: actives.page, props: component })
      } else {
        console.log(`%c[Adding component]`, `color:#95a5a6;`, component)
        const slot = addComponent(component)
        id = slot.id
        component = slot.component as any
        console.log(`%c[Added component]`, `color:#00b406;`, slot)
      }

      if (actives.componentId !== id) {
        setActives((prev) => ({ ...prev, componentId: id }))
      }

      return { id, component }
    },
    [actives, addComponent, components, updateComponent, viewport],
  )

  const onSlotClick = React.useCallback(
    ({
      id,
      item: slot,
    }: Parameters<
      NonNullable<SlotProps<t.BoardComponentSlot>['onClick']>
    >[0]) => {
      if (u.isObj(slot) && 'component' in slot) {
        if (actives.componentId !== id) {
          setActives((prev) => ({ ...prev, componentId: id }))
        }
      }
    },
    [actives.componentId],
  )

  const onResize = React.useCallback(
    ({
      id,
      item: slot,
      ref,
    }: // width,
    // height,
    Parameters<
      NonNullable<SlotProps<t.BoardComponentSlot>['onResize']>
    >[0]) => {
      if (u.isObj(slot?.component?.style)) {
        const getSize = (sizeKey: 'width' | 'height', size: number) =>
          revert([sizeKey, `${size}px`], { root: {}, viewport })
        const { width, height } = ref.getBoundingClientRect()
        let updated = false
        updateComponent((draft) => {
          const comp = findComponent(draft, actives.page, id)
          if (comp) {
            const { component } = comp
            !component.style && (component.style = {})
            component.style.width = getSize('width', width)
            component.style.height = getSize('height', height)
            updated = true
          } else {
            console.log(
              `%cCould not find a component for slot id "${id}"`,
              `color:#ec0000;`,
              { id, ref, slot: comp },
            )
          }
        })
        if (updated) {
          if (actives.componentId !== id) {
            setActives((prev) => ({ ...prev, componentId: id }))
          }
        }
      }
    },
    [actives.componentId, actives.page],
  )

  const onResizeStop: NonNullable<
    SlotProps<nt.ComponentObject>['onResizeStop']
  > = React.useCallback(
    ({ id, ref, item }) => {
      if (item) {
        const makeTopLeftFn = (dir: 'top' | 'left') => (
          el: HTMLElement,
        ): number =>
          el.offsetParent
            ? el['offset' + dir.charAt(0).toUpperCase() + dir.substring(1)] +
              getTop(el.offsetParent as HTMLElement)
            : 0

        const getTop = makeTopLeftFn('top')
        const getLeft = makeTopLeftFn('left')

        // This top and left is relative to our custom viewport
        let top = getTop(ref)
        let left = getLeft(ref)
        let { width, height } = ref.getBoundingClientRect()
        let options = { viewport }
        let styleValuesToUpdate = {
          width: revert(['width', `${width}px`], options),
          height: revert(['height', `${height}px`], options),
          top: revert(['top', `${top}px`], options),
          left: revert(['left', `${left}px`], options),
        }

        updateComponent((draft) => {
          const comp = findComponent(draft, actives.page, id)
          if (comp) {
            const { component } = comp
            !component.style && (component.style = {})
            u.forEach(
              ([k, v]) => component.style && (component.style[k] = v),
              u.entries(styleValuesToUpdate),
            )
            if (actives.componentId !== id) {
              setActives((prev) => ({ ...prev, componentId: id }))
            }
          } else {
            console.log(
              `%cCould not find a component for slot id "${id}"`,
              `color:#ec0000;`,
              { id, ref, slot: comp },
            )
          }
        })
      }
    },
    [components, actives.componentId, setActives, updateComponent],
  )

  const toJSON = React.useCallback(
    (value: string) => yaml.parse(value, { logLevel: 'debug' }),
    [],
  )

  const toYAML = React.useCallback(
    (pageName: string, components: t.BoardComponentSlot[]) => {
      return toYML({
        [pageName]: u.reduce(
          components,
          (acc, slot) => {
            const result = u.array(
              toNoodl(slot, {
                pageName: actives.page,
                root: {},
                viewport,
              }),
            )[0]
            return result ? acc.concat(result) : acc
          },
          [],
        ),
      })
    },
    [],
  )

  const toolbarComponents: ToolbarProps['components'] = React.useMemo(
    () => [
      // {
      //   id: 'save-to-local-storage',
      //   type: 'button',
      //   icon: '/assets/synchronize.png',
      //   onClick: () => saveStateToLocalStorage(),
      //   description: 'Save your work to the local storage',
      //   disabled: true,
      // },
      {
        id: 'to-yml',
        type: 'button',
        icon: '/assets/yml.png',
        onClick: onOpen,
        description: 'Generate to YAML',
      },
      {
        id: 'to-json',
        type: 'button',
        icon: '/assets/json.png',
        onClick: onOpen,
        description: 'Generate to JSON',
        disabled: true,
      },
      { id: 'add', type: 'button', icon: '/assets/add.png', disabled: true },
      {
        id: 'cloud',
        type: 'button',
        icon: '/assets/cloud.png',
        disabled: true,
      },
      {
        id: 'refresh',
        type: 'button',
        icon: '/assets/refresh.png',
        disabled: true,
      },
      {
        id: 'trash',
        type: 'button',
        icon: '/assets/trash.png',
        disabled: true,
      },
    ],
    [actives.page],
  )

  const ymlOutput = components?.length ? toYAML(actives.page, components) : ''

  return (
    <NuiProvider value={ctx}>
      <Box display="flex" justifyContent="center" flexDir="column">
        <Editor
          assetsUrl="/assets/"
          cols={20}
          layout={layout}
          onLayoutChange={setLayout}
          width={900}
          height={700}
          viewport={viewport}
          isBounded
        >
          <Panel id="pages" display="flex" alignItems="center">
            <Select placeholder="Pages" isDisabled />
          </Panel>
          <Panel id="components">
            <ComponentsPanel>
              {/* <Box id="view" fontSize="sm">
                View
              </Box>
              <Box id="image" fontSize="sm">
                Image
              </Box>
              <Box id="textField" fontSize="sm">
                Textfield
              </Box>
              <Box id="select" fontSize="sm">
                Select
              </Box>
              <Box id="button" fontSize="sm">
                Button
              </Box> */}
              <Box id="view">View</Box>
              <Image
                id="image"
                src="/assets/image.png"
                objectFit="scale-down"
              />
              <Input id="textField" value="Textfield" />
              <Select id="select" placeholder="Select" />
              <Button id="button" bg="transparent" fontWeight={300}>
                Button
              </Button>
            </ComponentsPanel>
          </Panel>
          <Panel id="page-settings" center>
            <ToolbarPageInput
              title="Set the current page"
              defaultValue={actives.page}
              onSubmit={(page) => setActives((prev) => ({ ...prev, page }))}
              placeholder="Page name"
            />
          </Panel>
          <Panel id="toolbar" center>
            <Toolbar components={toolbarComponents} />
          </Panel>
          <Panel id="board" shadow>
            <BoardComponent
              ref={boardRef as any}
              findComponentById={findComponentById}
              page={actives.page}
              onClick={onSlotClick}
              onDrop={onDrop as any}
              onResize={onResize}
              onResizeStop={onResizeStop}
              margin="auto"
            />
          </Panel>
          <Panel id="configuration-tools" shadow>
            <Router>
              <Routes>
                <Route
                  path="/"
                  caseSensitive
                  element={
                    <ComponentConfigurationPanel
                      find={findComponent}
                      update={updateComponent}
                    />
                  }
                />
              </Routes>
            </Router>
          </Panel>
        </Editor>
      </Box>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        footer={{
          close: true,
          actions: (
            <Button
              type="button"
              onClick={() => navigator.clipboard.writeText(ymlOutput)}
            >
              Copy
            </Button>
          ),
        }}
      >
        {ymlOutput || <Box textAlign="center">No page or components</Box>}
      </Modal>
    </NuiProvider>
  )
}

App.whyDidYouRender = true

export default App
