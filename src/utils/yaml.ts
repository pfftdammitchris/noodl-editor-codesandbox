import yaml, { ParseOptions } from 'yaml'

export function toYML(value: any, options?: ParseOptions) {
  return yaml.stringify(value, {
    ...options,
    indent: 2,
    logLevel: 'debug',
    prettyErrors: true,
  })
}

export function toJSON(yml = '', options?: ParseOptions) {
  return yaml.parse(yml, {
    ...options,
    logLevel: 'debug',
    prettyErrors: true,
  })
}
