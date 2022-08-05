import React from 'react'
import { Input, InputProps } from '@chakra-ui/react'
import * as u from '@jsmanifest/utils'
import KeyValueFieldBase, {
  KeyValueFieldBaseProps,
} from './key-value-field-base'
import AutoCompleteKeyValueField from './auto-complete-key-value-field'

export interface InputKeyValueFieldProps
  extends KeyValueFieldBaseProps,
    Omit<InputProps, 'autoComplete' | 'onChange'> {
  autoComplete?:
    | boolean
    | {
        options?: string[]
      }
  field: string
  onChange?(
    evt: React.ChangeEvent<HTMLInputElement>,
    field: string,
    ref: React.RefObject<HTMLInputElement>,
  ): void
}

const InputKeyValueField = React.memo(
  ({
    autoComplete: autoCompleteProp = false,
    containerProps,
    textProps,
    label,
    value,
    onChange,
    field,
    ...rest
  }: InputKeyValueFieldProps) => {
    const ref = React.useRef<HTMLInputElement>(null)

    const isAutoComplete =
      u.isObj(autoCompleteProp) && u.isArr(autoCompleteProp.options)

    const allAutoCompleteOptions = React.useMemo(
      () => (isAutoComplete ? (autoCompleteProp.options as string[]) : []),
      [autoCompleteProp],
    )

    let children: React.ReactNode

    if (u.isObj(autoCompleteProp) && u.isArr(autoCompleteProp.options)) {
      children = (
        <AutoCompleteKeyValueField
          ref={ref}
          field={field}
          options={allAutoCompleteOptions}
          value={value || ''}
          onChange={(value) => onChange?.({ target: { value } }, field, ref)}
        />
      )
    } else {
      children = (
        <Input
          name={field}
          margin={0.5}
          ref={ref}
          size="xs"
          value={value || ''}
          onChange={(evt) => onChange?.(evt, field, ref)}
          {...rest}
          w="full"
        />
      )
    }

    return (
      <KeyValueFieldBase
        label={label}
        containerProps={containerProps}
        textProps={textProps}
      >
        {children}
      </KeyValueFieldBase>
    )
  },
)

InputKeyValueField.whyDidYouRender = true

export default React.memo(InputKeyValueField, (p, np) => {
  if (p.defaultValue !== np.defaultValue) return false
  if (p.value !== np.value) return false
  return true
})
