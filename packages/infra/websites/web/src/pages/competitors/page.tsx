import { Link, useParams } from 'react-router'
import { CompetitorApproval, type Competitor } from '@/api/models/competitor'
import { useCompetitorsApprovalData } from '@/layout/hooks/api/use-competitors-approval-data'
import { useCompetitorsData } from '@/layout/hooks/api/use-competitors-data'
import { useMarkCompetitorData } from '@/layout/hooks/api/use-mark-competitor-data'
import { ApprovalBar } from '@/pages/competitors/components/approval-bar'
import { CompetitorsError } from '@/pages/competitors/components/competitors-error'
import { CompetitorsList } from '@/pages/competitors/components/competitors-list'
import { CompetitorsLoading } from '@/pages/competitors/components/competitors-loading'
import { PromptsPair } from '@/pages/competitors/components/prompts-pair'
import { sortCompetitors } from '@/pages/competitors/utils/sort-competitors'
import { formatDate } from '@/pages/project/utils/format-date'

export function CompetitorsPage() {
  const { projectId = '' } = useParams()
  const competitorsRequest = useCompetitorsData(projectId)
  const markRequest = useMarkCompetitorData(projectId)
  const approvalRequest = useCompetitorsApprovalData(projectId)
  const { data, isLoading, isError } = competitorsRequest.state

  if (isLoading) return <CompetitorsLoading />
  if (isError || !data) return <CompetitorsError onRetry={() => competitorsRequest.actions.refetch()} />

  const { competitors, approval } = data
  const { active, marked, mainCount, secondaryCount } = sortCompetitors(competitors)
  const isApproved = approval === CompetitorApproval.APPROVED
  const lastQualifiedAt = competitors.map((competitor) => competitor.qualifiedAt).sort().at(-1)
  const isPending = markRequest.state.isPending || approvalRequest.state.isPending
  const hasActionError = markRequest.state.error !== null || approvalRequest.state.error !== null

  function handleToggleIncorrect(competitor: Competitor) {
    markRequest.actions.mutateAsync({ competitorId: competitor.id, incorrect: !competitor.incorrect }).catch(() => undefined)
  }

  return (
    <div className="px-9 pb-10 pt-7">
      <nav aria-label="Caminho" className="mb-2 text-[13px] text-ink-3">
        <Link to={`/projects/${projectId}`} className="text-ink-2">
          Projeto
        </Link>
        {' / Concorrentes'}
      </nav>
      <h1 className="font-brand text-[34px] font-extrabold leading-tight tracking-[-0.025em]">Concorrentes</h1>
      {competitors.length > 0 && (
        <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
          <span>{competitors.length} identificados</span>
          <span>
            {active.length} na análise · {mainCount} principais, {secondaryCount} secundários
          </span>
          {marked.length > 0 && <span>{marked.length} marcado “Não é concorrente”</span>}
          {lastQualifiedAt && <span>Qualificado {formatDate(lastQualifiedAt)}</span>}
        </p>
      )}
      {hasActionError && (
        <p role="alert" className="mt-4 rounded-2 bg-card px-4 py-3 text-sm font-semibold text-attention shadow-1">
          Não foi possível salvar a mudança. Tente de novo.
        </p>
      )}
      <ApprovalBar
        approval={approval}
        competitorsCount={competitors.length}
        activeCount={active.length}
        markedCount={marked.length}
        isPending={isPending}
        onApprove={() => approvalRequest.actions.mutateAsync(true).catch(() => undefined)}
        onReopen={() => approvalRequest.actions.mutateAsync(false).catch(() => undefined)}
      />
      <PromptsPair projectId={projectId} isApproved={isApproved} />
      <CompetitorsList competitors={competitors} isPending={isPending} onToggleIncorrect={handleToggleIncorrect} />
    </div>
  )
}
