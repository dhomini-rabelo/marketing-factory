import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { SeoRoundStatus, type SeoRound } from '@/api/models/seo'
import { API_URL } from '@/core/config'
import { CopyButton } from '@/layout/components/common/copy-button/copy-button'
import { buildSeoCompletePrompt } from '@/layout/utils/prompts/build-seo-prompt'

type SeoPartialBannerProps = {
  round: SeoRound
}

export function SeoPartialBanner({ round }: SeoPartialBannerProps) {
  const { projectId = '' } = useParams()
  const commandRef = useRef<HTMLPreElement>(null)
  const [isCommandVisible, setIsCommandVisible] = useState(false)

  if (round.status !== SeoRoundStatus.PARTIAL) return null

  const commandText = buildSeoCompletePrompt({
    projectId,
    apiUrl: API_URL,
    roundId: round.id,
    missing: round.missing,
  })

  function handleCopyFailed() {
    setIsCommandVisible(true)
  }

  return (
    <div role="status" data-secao="rodada-parcial" className="mt-3 rounded-2 border-l-4 border-attention bg-card px-3.5 py-2.5 text-[13px] shadow-1">
      <p>
        <b>Rodada parcial.</b> Ainda faltam: {round.missing.join(', ')}.
      </p>
      <p className="mt-1 text-ink-2">Copie o comando e cole no Claude Code para completar a rodada.</p>
      <div className="max-w-xs">
        <CopyButton
          textToCopy={commandText}
          selectableRef={commandRef}
          label="Copiar comando para completar"
          variant="secondary"
          onCopyFailed={handleCopyFailed}
        />
      </div>
      {isCommandVisible && (
        <pre
          ref={commandRef}
          className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-1 bg-code-bg px-3 py-2.5 font-mono text-xs text-code-text"
        >
          {commandText}
        </pre>
      )}
    </div>
  )
}
