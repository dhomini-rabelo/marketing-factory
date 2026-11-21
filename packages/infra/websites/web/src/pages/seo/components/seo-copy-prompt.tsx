import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import { API_URL } from '@/core/config'
import { CopyButton } from '@/layout/components/common/copy-button/copy-button'
import { buildSeoPrompt } from '@/layout/utils/prompts/build-seo-prompt'

export function SeoCopyPrompt() {
  const { projectId = '' } = useParams()
  const promptRef = useRef<HTMLPreElement>(null)
  const [isPromptVisible, setIsPromptVisible] = useState(false)
  const promptText = buildSeoPrompt({ projectId, apiUrl: API_URL })

  function handleCopyFailed() {
    setIsPromptVisible(true)
  }

  return (
    <div className="w-44 [&>div]:mt-0">
      <CopyButton
        textToCopy={promptText}
        selectableRef={promptRef}
        label="Copiar prompt"
        variant="secondary"
        onCopyFailed={handleCopyFailed}
      />
      {isPromptVisible && (
        <pre
          ref={promptRef}
          className="absolute right-0 z-10 mt-2 max-h-64 w-[480px] overflow-auto whitespace-pre-wrap break-words rounded-1 bg-code-bg px-3 py-2.5 font-mono text-xs text-code-text shadow-2"
        >
          {promptText}
        </pre>
      )}
    </div>
  )
}
