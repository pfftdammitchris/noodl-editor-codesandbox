import React from 'react'
import {
  Box,
  forwardRef,
  Input,
  InputProps,
  List,
  ListItem,
} from '@chakra-ui/react'
import Downshift, { useCombobox } from 'downshift'
import type { UseComboboxState, UseComboboxStateChangeOptions } from 'downshift'
import * as u from '@jsmanifest/utils'

const { stateChangeTypes } = Downshift

export interface AutoCompleteKeyValueFieldProps
  extends Omit<InputProps, 'onChange'> {
  field: string
  options: string[]
  onChange?(value: string): void
}

const stateReducer = (
  state: UseComboboxState<any>,
  actionAndChanges: UseComboboxStateChangeOptions<any>,
): UseComboboxState<any> => {
  const { type, changes } = actionAndChanges

  console.log(`%c[stateReducer]`, `color:#c4a901;`, {
    actionAndChanges,
    state,
  })

  // this prevents the menu from being closed when the user
  // selects an item with a keyboard or mouse
  switch (type) {
    case useCombobox.stateChangeTypes.FunctionOpenMenu:
    case useCombobox.stateChangeTypes.InputBlur:
    case useCombobox.stateChangeTypes.MenuMouseLeave:
      return {
        ...state,
        ...changes,
        isOpen: state.isOpen,
        highlightedIndex: state.highlightedIndex,
      }
    default:
      return { ...state, ...changes }
  }
}

function AutoCompleteKeyValueField(
  {
    field,
    options,
    value = '',
    onChange,
    ...rest
  }: AutoCompleteKeyValueFieldProps,
  ref,
) {
  const [autoCompleteOptions, setAutoCompleteOptions] = React.useState(options)

  const {
    inputValue,
    isOpen,
    selectedItem,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
    openMenu,
  } = useCombobox({
    items: options,
    defaultInputValue: value as string,
    onHighlightedIndexChange: ({ highlightedIndex }) => {
      if (u.isNum(highlightedIndex)) {
        onChange?.(autoCompleteOptions[highlightedIndex])
        return autoCompleteOptions[highlightedIndex]
      }
    },
    onInputValueChange: ({ inputValue = '' }) => {
      onChange?.(inputValue)
      setAutoCompleteOptions(
        u.filter(
          (item) =>
            !!item.toLowerCase().startsWith(inputValue?.toLowerCase() || ''),
          options,
        ),
      )
    },
    stateReducer,
  })

  return (
    <Box
      position="relative"
      {...getComboboxProps()}
      onClick={() => {
        setAutoCompleteOptions(options)
        openMenu()
      }}
    >
      <Input
        id={field}
        name={field}
        margin={0.5}
        ref={ref}
        size="xs"
        {...rest}
        {...getInputProps({
          value: inputValue || '',
        })}
      />
      <List
        position="absolute"
        top={30}
        left={0}
        {...getMenuProps()}
        css={{
          backgroundColor: '#fff !important',
          height: '100%',
          zIndex: 999,
        }}
      >
        {isOpen &&
          (autoCompleteOptions as string[]).map((item, index) => (
            <ListItem
              style={
                highlightedIndex === index
                  ? { backgroundColor: '#bde4ff' }
                  : { backgroundColor: '#fff' }
              }
              fontSize="sm"
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </ListItem>
          ))}
      </List>
    </Box>
  )
}

AutoCompleteKeyValueField.whyDidYouRender = true

export default React.memo(forwardRef(AutoCompleteKeyValueField), (p, np) => {
  if (p.value !== np.value) return false
  if (p.options?.length !== np.options?.length) return false
  return true
})
