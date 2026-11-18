import { DangerErrors, DomainError } from '@domain/base'

export function toEnumMember<Member extends string>(
  enumeration: Record<string, Member>,
  value: string,
): Member {
  const member = Object.values(enumeration).find((candidate) => candidate === value)

  if (member === undefined) {
    throw new DomainError({
      code: 'INVALID_ENUM_MEMBER',
      errorType: DangerErrors.DATA_INTEGRITY,
      variables: [value],
    })
  }

  return member
}
