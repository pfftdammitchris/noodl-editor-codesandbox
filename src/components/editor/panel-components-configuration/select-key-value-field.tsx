import React from 'react'
import { Flex, Input, Select, SelectProps } from '@chakra-ui/react'
import KeyValueFieldBase, {
  KeyValueFieldBaseProps,
} from './key-value-field-base'

export interface SelectKeyValueFieldProps extends KeyValueFieldBaseProps {}

function SelectKeyValueField({
  label,
  containerProps,
  textProps,
  value,
  onChange,
  field = '',
  options = [],
  ...rest
}: SelectKeyValueFieldProps &
  SelectProps & {
    value?: string
    onChange?(
      event: React.ChangeEvent<HTMLSelectElement>,
      field: string,
      ref: React.RefObject<HTMLSelectElement>,
    ): void
    options: any[]
  }) {
  const ref = React.useRef<HTMLSelectElement>(null)
  return (
    <KeyValueFieldBase
      label={label}
      containerProps={containerProps}
      textProps={textProps}
    >
      <Flex w="full" alignItems="center">
        <Input
          value=""
          onChange={undefined}
          placeholder="Add"
          size="xs"
          disabled
          w={55}
        />
        <span style={{ width: 5 }} />
        <Select
          name={field}
          ref={ref}
          size="xs"
          value={value}
          onChange={(evt) => onChange?.(evt, field, ref)}
          placeholder="Select"
          style={{ textAlignLast: 'center' }}
          disabled
          {...rest}
          w="full"
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </Select>
      </Flex>
    </KeyValueFieldBase>
  )
}

SelectKeyValueField.whyDidYouRender = true

export default React.memo(SelectKeyValueField, (p, np) => p.value === np.value)
