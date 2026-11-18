import { describe, expect, it } from 'vitest'
import { DomainError } from '@domain/base'
import { resolveChannel } from '@domain/competitor-analysis/application/use-cases/channel/resolve-channel'
import {
  CHANNEL_ORDER,
  Channel,
  PARTIAL_CHANNELS,
  isChannel,
  isPartialChannel,
} from '@domain/competitor-analysis/enterprise/entities/channel-analysis'

describe('channels', () => {
  it('lists the nine channels in the fixed order', () => {
    expect(CHANNEL_ORDER).toEqual([
      'seo',
      'site-pricing',
      'linkedin',
      'instagram',
      'youtube',
      'x',
      'tiktok',
      'reddit',
      'ads',
    ])
  })

  it('has every channel of the enum in the fixed order', () => {
    expect([...CHANNEL_ORDER].sort()).toEqual(Object.values(Channel).sort())
  })

  it('marks only x, tiktok, reddit and ads as partial', () => {
    const partialChannels = CHANNEL_ORDER.filter((channel) => isPartialChannel(channel))

    expect(partialChannels).toEqual(['x', 'tiktok', 'reddit', 'ads'])
    expect(PARTIAL_CHANNELS).toEqual(partialChannels)
  })

  it('recognizes only the nine channel keys', () => {
    expect(CHANNEL_ORDER.every((channel) => isChannel(channel))).toBe(true)
    expect(isChannel('facebook')).toBe(false)
    expect(isChannel('SEO')).toBe(false)
    expect(isChannel('')).toBe(false)
  })

  it('resolves a valid key to the channel', () => {
    expect(resolveChannel('linkedin')).toBe(Channel.LINKEDIN)
  })

  it('rejects an unknown key with CHANNEL_NOT_FOUND carrying the nine accepted keys', () => {
    expect(() => resolveChannel('facebook')).toThrow(DomainError)
    expect(() => resolveChannel('facebook')).toThrowError(
      expect.objectContaining({
        response: expect.objectContaining({
          code: 'CHANNEL_NOT_FOUND',
          variables: CHANNEL_ORDER,
        }),
      }),
    )
  })
})
