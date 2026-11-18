import { API_URL } from '@/core/config'
import { PromptCard } from '@/layout/components/common/prompt-card/prompt-card'
import { buildCompetitorsPrompt } from '@/layout/utils/prompts/build-competitors-prompt'
import { buildInitialResearchPrompt } from '@/layout/utils/prompts/build-initial-research-prompt'
import { LockedPromptCard } from '@/pages/competitors/components/locked-prompt-card'

type PromptsPairProps = {
  projectId: string
  isApproved: boolean
}

const COMPETITORS_HINT = 'O agente acha e qualifica os concorrentes e grava a lista aqui. Ele para sem pesquisar os canais.'
const INITIAL_RESEARCH_HINT = 'O agente estuda os nove canais usando a lista aprovada. Libera quando você aprovar a lista.'
const INITIAL_RESEARCH_TITLE = 'Pesquisa inicial dos canais'

export function PromptsPair({ projectId, isApproved }: PromptsPairProps) {
  const promptInput = { projectId, apiUrl: API_URL }
  const initialResearchPrompt = buildInitialResearchPrompt(promptInput)

  return (
    <div className="mt-4 grid grid-cols-2 items-start gap-4">
      <PromptCard
        step={1}
        title="Descobrir concorrentes"
        hint={COMPETITORS_HINT}
        promptText={buildCompetitorsPrompt(promptInput)}
        copyLabel="Copiar prompt de concorrentes"
        variant="primary"
      />
      {isApproved ? (
        <PromptCard
          step={2}
          title={INITIAL_RESEARCH_TITLE}
          hint={INITIAL_RESEARCH_HINT}
          promptText={initialResearchPrompt}
          copyLabel="Copiar prompt da pesquisa inicial"
          variant="secondary"
        />
      ) : (
        <LockedPromptCard
          step={2}
          title={INITIAL_RESEARCH_TITLE}
          hint={INITIAL_RESEARCH_HINT}
          promptText={initialResearchPrompt}
        />
      )}
    </div>
  )
}
