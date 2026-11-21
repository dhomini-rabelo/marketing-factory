import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import type { SeoRound } from '@/api/models/seo'
import { API_URL } from '@/core/config'
import { CopyButton } from '@/layout/components/common/copy-button/copy-button'
import { buildSeoCompletePrompt } from '@/layout/utils/prompts/build-seo-prompt'

type SeoCompleteCommandProps = {
  round: SeoRound
  missing: string[]
}

export function SeoCompleteCommand({ round, missing }: SeoCompleteCommandProps) {
  const { projectId = '' } = useParams()
  const commandRef = useRef<HTMLPreElement>(null)
  const [isCommandVisible, setIsCommandVisible] = useState(false)
  const commandText = buildSeoCompletePrompt({ projectId, apiUrl: API_URL, roundId: round.id, missing })

  return (
    <>
      <div className="max-w-xs">
        <CopyButton
          textToCopy={commandText}
          selectableRef={commandRef}
          label="Copiar comando para completar"
          variant="secondary"
          onCopyFailed={() => setIsCommandVisible(true)}
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
    </>
  )
}
