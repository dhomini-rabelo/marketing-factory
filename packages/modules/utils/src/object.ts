import { AnyRecord } from '@modules/utils/types'

export function showObject(object: any) {
  return JSON.stringify(object, null, 2)
}

export function isFieldInProps(field: string, props: AnyRecord): boolean {
  return field in props && props[field] !== undefined
}

type RemoveUndefinedKeys<T extends object> = {
  [Key in keyof T as T[Key] extends undefined ? never : Key]: T[Key]
}

export function removeKeysForUndefinedValues<T extends object>(
  object: T,
): RemoveUndefinedKeys<T> {
  return Object.fromEntries(
    Object.entries(object).filter((entry) => entry[1] !== undefined),
  ) as RemoveUndefinedKeys<T>
}
