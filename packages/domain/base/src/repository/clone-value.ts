import { ID } from '@domain/base/entity/id'

export function cloneValue<T>(value: T): T {
  if (value === null || value === undefined) {
    return value
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T
  }

  if (value instanceof ID) {
    return new ID(value.toValue()) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item)) as T
  }

  if (typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value)
    if (prototype !== Object.prototype && prototype !== null) {
      return value
    }

    const cloned: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      cloned[key] = cloneValue((value as Record<string, unknown>)[key])
    }
    return cloned as T
  }

  return value
}
