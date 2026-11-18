import { useRef, useState } from 'react'
import { CopyButton } from '@/layout/components/common/copy-button/copy-button'
import { cn } from '@/layout/utils/styles'

type PromptCardProps = {
  step: number
  title: string
  hint: string
  promptText: string
  variant: 'primary' | 'secondary'
}

const PREVIEW_CLASSES = 'max-h-24 overflow-hidden [mask-image:linear-gradient(#000_60%,transparent)]'
const COPY_LABELS = {
  primary: 'Copiar prompt de coleta',
  secondary: 'Copiar prompt de leitura',
}

export function PromptCard({ step, title, hint, promptText, variant }: PromptCardProps) {
  const promptRef = useRef<HTMLPreElement>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="relative rounded-3 bg-card p-4 shadow-2">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-[8px] bg-bg text-sm font-bold">{step}</span>
        <h3 className="text-[15px] font-bold">{title}</h3>
      </div>
      <p className="mb-2.5 mt-2 text-[13px] text-ink-2">{hint}</p>
      <pre
        ref={promptRef}
        className={cn(
          'whitespace-pre-wrap break-words rounded-1 bg-code-bg px-3 py-2.5 font-mono text-xs leading-[1.55] text-code-text',
          !isExpanded && PREVIEW_CLASSES,
        )}
      >
        {promptText}
      </pre>
      <CopyButton
        textToCopy={promptText}
        selectableRef={promptRef}
        label={COPY_LABELS[variant]}
        variant={variant}
        onCopyFailed={() => setIsExpanded(true)}
      />
    </section>
  )
}
