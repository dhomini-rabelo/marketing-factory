import { useEffect, useState, type RefObject } from 'react'
import { COPIED_FEEDBACK_MS } from '@/layout/utils/copy-feedback'
import { cn } from '@/layout/utils/styles'

type CopyStatus = 'idle' | 'copied' | 'failed'

type CopyButtonVariant = 'primary' | 'secondary'

type CopyButtonProps = {
  textToCopy: string
  selectableRef: RefObject<HTMLElement | null>
  label: string
  variant: CopyButtonVariant
  onCopyFailed?: () => void
}

const VARIANT_CLASSES: Record<CopyButtonVariant, string> = {
  primary: 'bg-brand text-on-brand',
  secondary: 'bg-ink text-white',
}
const COPIED_CLASSES = 'bg-support text-white'
const FAILED_MESSAGE = 'Não foi possível copiar. Selecione o texto e copie à mão.'

export function CopyButton({
  textToCopy,
  selectableRef,
  label,
  variant,
  onCopyFailed,
}: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>('idle')

  useEffect(() => {
    if (status !== 'copied') return
    const timer = setTimeout(() => setStatus('idle'), COPIED_FEEDBACK_MS)
    return () => clearTimeout(timer)
  }, [status])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textToCopy)
      setStatus('copied')
    } catch {
      if (selectableRef.current) window.getSelection()?.selectAllChildren(selectableRef.current)
      setStatus('failed')
      onCopyFailed?.()
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-2 p-[11px] text-sm font-bold',
          status === 'copied' ? COPIED_CLASSES : VARIANT_CLASSES[variant],
        )}
        onClick={handleCopy}
      >
        <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
          <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 10V3a.5.5 0 0 1 .5-.5h7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {status === 'copied' ? 'Copiado' : label}
      </button>
      {status === 'failed' && (
        <p role="alert" className="mt-2 text-xs text-attention">
          {FAILED_MESSAGE}
        </p>
      )}
    </div>
  )
}
