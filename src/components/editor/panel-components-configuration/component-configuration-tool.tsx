import React, { RefObject } from 'react'
import { Box, Flex, Heading, IconButton, Text } from '@chakra-ui/react'
import set from 'lodash.set'
import { useRecoilValue } from 'recoil'
import { current } from 'immer'
import { useDrag } from 'react-dnd'
import { revert } from '../../../utils/nui'
import usePageComponents from '../../../hooks/use-page-components'
import {
  selectActiveComponentId,
  selectActivePage,
} from '../../../store/selectors'
import { pagesState, rootState, viewportState } from '../../../store/atoms'
import type { RootState, ViewportState } from '../../../store/atoms'
import { ItemType } from '../../../constants'
import SelectKeyValueField from './select-key-value-field'
import InputKeyValueField from './input-key-value-field'

export interface ComponentConfigurationToolProps {
  find?: ReturnType<typeof usePageComponents>['findComponent']
  update?: ReturnType<typeof usePageComponents>['updateComponent']
}

const makeOnChange = function ({
  id = '',
  key,
  page = '',
  root,
  viewport,
  find,
  update,
}: Pick<ComponentConfigurationToolProps, 'find' | 'update'> & {
  key: string
  id: string
  page: string
  ref: RefObject<HTMLInputElement>
  root: RootState
  viewport: ViewportState
}) {
  function onChange(evt: React.ChangeEvent<HTMLInputElement>, field: string) {
    update?.((draft) => {
      const component = find?.(draft, page, id)?.component
      if (component) {
        set(
          component,
          field,
          revert([key, evt.target.value], {
            assetsUrl: '/assets/',
            root,
            viewport,
          }),
        )
      } else {
        console.log(
          `%c[${id}] Component not found in state`,
          `color:#ec0000;`,
          {
            component,
            event: evt,
            field,
            id,
            key,
            page,
            state: current(draft),
          },
        )
      }
    })
  }
  return onChange
}

function ComponentConfigurationTool({
  find,
  update,
}: React.PropsWithChildren<ComponentConfigurationToolProps>) {
  const ref = React.useRef<any>()
  const id = useRecoilValue(selectActiveComponentId)
  const page = useRecoilValue(selectActivePage)
  const pages = useRecoilValue(pagesState)
  const root = useRecoilValue(rootState)
  const viewport = useRecoilValue(viewportState)
  const component = pages[page]?.components?.find?.((obj) => obj.id === id)
    ?.component

  const [collectedProps, drag] = useDrag({
    type: ItemType.COMPONENTS_PANEL,
    canDrag: () => false,
    collect: (monitor) => {},
    item: {},
  })

  drag(ref)

  const onChangeFactory = React.useMemo(
    () => (key: string) =>
      makeOnChange({
        id,
        find,
        key,
        page,
        ref,
        root,
        viewport,
        update,
      } as Parameters<typeof makeOnChange>[0]),
    [id, component, page, pages],
  )

  const onChange = {
    type: onChangeFactory('type'),
    contentType: onChangeFactory('contentType'),
    path: onChangeFactory('path'),
    placeholder: onChangeFactory('placeholder'),
    select: onChangeFactory('options'),
    style: onChangeFactory('style'),
    dataKey: onChangeFactory('dataKey'),
    viewTag: onChangeFactory('viewTag'),
  }

  let children: React.ReactNode

  if (!component) {
    children = (
      <Text textAlign="center">
        Drag a component to the board for options to reveal
      </Text>
    )
  } else {
    const alignmentKeyValues = [
      {
        key: 'align',
        label: 'Align',
        onChange: onChange.style,
        autoComplete: { options: ['centerX', 'centerY'] },
      },
      {
        key: 'axis',
        label: 'Axis',
        onChange: onChange.style,
        autoComplete: { options: ['horizontal', 'vertical'] },
      },
      // TODO - textAlign { x, y }
      {
        key: 'textAlign',
        label: 'Text align',
        onChange: onChange.style,
        autoComplete: { options: ['left', 'center', 'right'] },
      },
    ]

    const topLeftWidthHeightKeyValues = [
      { key: 'top', label: 'Top', onChange: onChange.style },
      { key: 'marginTop', label: 'Margin top', onChange: onChange.style },
      { key: 'left', label: 'Left', onChange: onChange.style },
      {
        key: 'width',
        label: 'Width',
        onChange: onChange.style,
        isDisabled: true,
      },
      {
        key: 'height',
        label: 'Height',
        onChange: onChange.style,
        isDisabled: true,
      },
    ]

    const borderPresetKeyValues = [
      { key: 'border.style.0', label: 'Preset 0' },
      { key: 'border.style.1', label: 'Preset 1' },
      { key: 'border.style.2', label: 'Preset 2' },
      { key: 'border.style.3', label: 'Preset 3' },
      { key: 'border.style.4', label: 'Preset 4' },
      { key: 'border.style.5', label: 'Preset 5' },
      { key: 'border.style.6', label: 'Preset 6' },
      { key: 'border.style.7', label: 'Preset 7' },
    ]

    children = (
      <>
        <InputKeyValueField
          field="type"
          label="Type"
          value={component.type || ''}
          onChange={onChange.type}
        />
        <InputKeyValueField
          field="contentType"
          label="Content type"
          value={component.contentType || ''}
          onChange={onChange.contentType}
        />
        {'path' in component && (
          <InputKeyValueField
            field="path"
            value={component.path || ''}
            label="Path"
            onChange={onChange.path}
            autoComplete={{
              options: [
                'add.png',
                'calendar.png',
                'cloud.png',
                'download.png',
                'dragger.png',
                'email-sent.png',
                'forgot-password.png',
                'logo.png',
                'json.png',
                'refresh.png',
                'save.png',
                'search.png',
                'synchronize.png',
                'trash.png',
                'yml.png',
              ],
            }}
          />
        )}
        {'options' in component && (
          <SelectKeyValueField
            field="options"
            label="Options"
            value=""
            onChange={onChange.select}
          />
        )}
        {'dataKey' in component && component.type === 'textField' && (
          <InputKeyValueField
            field="dataKey"
            value={component.dataKey || ''}
            label="Data key"
            onChange={onChange.dataKey}
            isDisabled
          />
        )}
        {component.type === 'textField' && (
          <InputKeyValueField
            field="placeholder"
            value={component.placeholder || ''}
            label="Placeholder"
            onChange={onChange.placeholder}
          />
        )}
        <InputKeyValueField
          field="viewTag"
          value={component.viewTag || ''}
          label="View tag"
          onChange={onChange.viewTag}
        />
        <Box mt={4}>
          <Text>Styles</Text>
          <Box>
            {topLeftWidthHeightKeyValues.map(({ key, ...rest }) => (
              <InputKeyValueField
                key={`style.${key}`}
                field={`style.${key}`}
                value={component.style?.[key] || ''}
                {...rest}
              />
            ))}
            <SelectKeyValueField
              field="style.border"
              label="Border"
              placeholder="Presets"
              options={[
                'Preset 1',
                'Preset 2',
                'Preset 3',
                'Preset 4',
                'Preset 5',
                'Preset 6',
                'Preset 7',
              ]}
            />
            {alignmentKeyValues.map(({ key, ...rest }) => (
              <InputKeyValueField
                key={`style.${key}`}
                field={`style.${key}`}
                value={component.style?.[key] || ''}
                {...rest}
              />
            ))}
          </Box>
        </Box>
      </>
    )
  }

  return (
    <Box>
      <Heading size="sm" textAlign="center">
        <Flex
          pt={1}
          pl={4}
          pr={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>Configuration</Box>
          <IconButton
            aria-label="Add user events"
            title="Add onClick, onMouseOver, etc"
            background="transparent"
            disabled
          >
            <img src="/assets/add.png" alt="" width={25} height={25} />
          </IconButton>
        </Flex>
      </Heading>
      <Box ref={ref} id={id} p={3} pt={0}>
        {children}
      </Box>
    </Box>
  )
}

ComponentConfigurationTool.whyDidYouRender = true

export default React.memo(ComponentConfigurationTool)
