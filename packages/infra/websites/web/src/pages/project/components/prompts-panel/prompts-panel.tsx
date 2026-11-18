import { API_URL } from '@/core/config'
import { PromptCard } from '@/layout/components/common/prompt-card/prompt-card'
import { buildCollectionPrompt } from '@/layout/utils/prompts/build-collection-prompt'
import { buildReadingPrompt } from '@/layout/utils/prompts/build-reading-prompt'

type PromptsPanelProps = {
  projectId: string
}

export function PromptsPanel({ projectId }: PromptsPanelProps) {
  const promptInput = { projectId, apiUrl: API_URL }

  return (
    <aside data-secao="prompts" className="grid min-w-0 gap-3.5">
      <h2 className="text-sm font-semibold text-ink-2">Mandar para um agente</h2>
      <PromptCard
        step={1}
        title="Coletar do repositório"
        hint="Cole no Claude Code aberto na pasta do repositório. Ele lê o código e grava os documentos aqui."
        promptText={buildCollectionPrompt(promptInput)}
        copyLabel="Copiar prompt de coleta"
        variant="primary"
      />
      <div className="flex items-center gap-2 pl-3.5 text-[13px] text-ink-3">
        <svg width="12" height="16" viewBox="0 0 12 16" aria-hidden="true">
          <path d="M6 1v13M1.5 9.5 6 14l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        depois, para criar post, artigo ou vídeo
      </div>
      <PromptCard
        step={2}
        title="Usar no marketing"
        hint="Dê a um agente de marketing com o canal: SEO, Instagram, Facebook, TikTok."
        promptText={buildReadingPrompt(promptInput)}
        copyLabel="Copiar prompt de leitura"
        variant="secondary"
      />
    </aside>
  )
}
