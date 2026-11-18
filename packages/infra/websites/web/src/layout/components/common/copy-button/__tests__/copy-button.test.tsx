import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CopyButton } from '@/layout/components/common/copy-button/copy-button'

const PROMPT = 'Leia o repositório e grave os documentos.'

type HarnessProps = {
  onCopyFailed?: () => void
}

function Harness({ onCopyFailed }: HarnessProps) {
  const promptRef = useRef<HTMLPreElement>(null)

  return (
    <>
      <pre ref={promptRef}>{PROMPT}</pre>
      <CopyButton
        textToCopy={PROMPT}
        selectableRef={promptRef}
        label="Copiar prompt de coleta"
        variant="primary"
        onCopyFailed={onCopyFailed}
      />
    </>
  )
}

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
}

async function clickCopy() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /Copiar prompt de coleta|Copiado/ }))
  })
}

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    window.getSelection()?.removeAllRanges()
  })

  it('copies the text, shows "Copiado" for two seconds and goes back to the label', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    stubClipboard(writeText)
    render(<Harness />)

    await clickCopy()

    expect(writeText).toHaveBeenCalledWith(PROMPT)
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1999)
    })
    expect(screen.getByRole('button', { name: 'Copiado' })).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByRole('button', { name: 'Copiar prompt de coleta' })).toBeInTheDocument()
  })

  it('selects the indicated text, warns and calls onCopyFailed when the copy is refused', async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    const onCopyFailed = vi.fn()
    render(<Harness onCopyFailed={onCopyFailed} />)

    await clickCopy()

    expect(window.getSelection()?.toString()).toBe(PROMPT)
    expect(onCopyFailed).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível copiar. Selecione o texto e copie à mão.',
    )
    expect(screen.queryByRole('button', { name: 'Copiado' })).not.toBeInTheDocument()
  })

  it('does not warn when the copy works', async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined))
    const onCopyFailed = vi.fn()
    render(<Harness onCopyFailed={onCopyFailed} />)

    await clickCopy()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(onCopyFailed).not.toHaveBeenCalled()
  })
})
