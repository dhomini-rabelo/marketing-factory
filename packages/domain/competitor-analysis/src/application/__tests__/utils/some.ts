import { randomUUID } from 'node:crypto'

const NAME_SUFFIX_LENGTH = 8

export const some = {
  string(): string {
    return randomUUID().replaceAll('-', '')
  },

  name(): string {
    return `Name ${randomUUID().slice(0, NAME_SUFFIX_LENGTH)}`
  },

  stringWithLength(length: number): string {
    return 'x'.repeat(length)
  },

  valueBetween<Value>(...values: Value[]): Value {
    return values[Math.floor(Math.random() * values.length)]
  },
}
