import { DangerErrors, DomainError } from '@domain/base'
import {
  CHANNEL_ORDER,
  Channel,
  isChannel,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

export function resolveChannel(value: string): Channel {
  if (!isChannel(value)) {
    throw new DomainError({
      code: 'CHANNEL_NOT_FOUND',
      errorType: DangerErrors.NOT_FOUND,
      variables: CHANNEL_ORDER,
    })
  }

  return value
}
