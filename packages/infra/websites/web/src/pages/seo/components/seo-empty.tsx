import { Link, useParams } from 'react-router'
import { CompetitorApproval } from '@/api/models/competitor'
import { API_URL } from '@/core/config'
import { LockedPromptCard } from '@/layout/components/common/locked-prompt-card/locked-prompt-card'
import { PromptCard } from '@/layout/components/common/prompt-card/prompt-card'
import { useCompetitorsData } from '@/layout/hooks/api/use-competitors-data'
import { buildSeoPrompt } from '@/layout/utils/prompts/build-seo-prompt'

const CARD_TITLE = 'Coleta de SEO e blog'
const CARD_HINT =
  'O agente lê o projeto e os concorrentes aprovados pela API e grava a rodada de SEO aqui, um concorrente por vez.'

export function SeoEmpty() {
  const { projectId = '' } = useParams()
  const competitorsRequest = useCompetitorsData(projectId)
  const isApproved = competitorsRequest.state.data?.approval === CompetitorApproval.APPROVED
  const promptText = buildSeoPrompt({ projectId, apiUrl: API_URL })

  return (
    <div className="mt-6 max-w-2xl">
      <p className="mb-4 text-ink-2">Nenhuma rodada de SEO gravada ainda.</p>
      {isApproved ? (
        <PromptCard
          step={1}
          title={CARD_TITLE}
          hint={CARD_HINT}
          promptText={promptText}
          copyLabel="Copiar prompt"
          variant="primary"
        />
      ) : (
        <>
          <p role="status" className="mb-4 rounded-2 bg-card px-4 py-3 text-sm font-semibold text-attention shadow-1">
            Aprove a lista de concorrentes antes de coletar o SEO.{' '}
            <Link to={`/projects/${projectId}/competitors`} className="underline">
              Ir para Concorrentes
            </Link>
          </p>
          <LockedPromptCard step={1} title={CARD_TITLE} hint={CARD_HINT} promptText={promptText} />
        </>
      )}
      <ol className="mt-4 list-decimal space-y-1 pl-5 text-[13px] text-ink-2">
        <li>Copie o prompt.</li>
        <li>Cole no Claude Code e espere o agente terminar.</li>
        <li>Recarregue esta tela para ver a rodada.</li>
      </ol>
    </div>
  )
}
