import * as u from '@jsmanifest/utils'
import nt from 'noodl-types'

export const regex = {
  noodlStyleKeys: new RegExp(`(${nt.styleKeys.join?.('|')})`),
}

export function getRandomKey() {
  return `_${Math.random().toString(36).substr(2, 9)}`
}

export function shallowEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || !a || typeof b !== 'object' || !b) return false
  const keysA = u.keys(a)
  const keysB = u.keys(b)
  if (keysA.length !== keysB.length) return false
  const bHasOwnProp = Object.prototype.hasOwnProperty.bind(b)
  for (let idx = 0; idx < keysA.length; idx++) {
    const key = keysA[idx]
    if (!bHasOwnProp(key) || a[key] !== b[key]) return false
  }
  return true
}
