import * as nt from 'noodl-types'
import { getRandomKey } from './common'
import { BoardComponentSlot } from '../types'

export default function toComponentSlot(
  comp: nt.ComponentObject | BoardComponentSlot,
): BoardComponentSlot {
  if ('component' in comp) return comp as BoardComponentSlot
  return { id: comp.id || getRandomKey(), component: comp }
}
