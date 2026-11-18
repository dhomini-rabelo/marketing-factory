import { CompetitorApproval } from '@/api/models/competitor'
import { Button } from '@/layout/components/ui/button'
import { cn } from '@/layout/utils/styles'

const BLOCKED_REASON_ID = 'approval-blocked-reason'

type ApprovalBarProps = {
  approval: CompetitorApproval
  competitorsCount: number
  activeCount: number
  markedCount: number
  isPending: boolean
  onApprove: () => void
  onReopen: () => void
}

type Step = { title: string; hint: string; isDone: boolean; isCurrent: boolean }

function buildSteps(isApproved: boolean, competitorsCount: number): Step[] {
  return [
    {
      title: 'Concorrentes',
      hint: competitorsCount > 0 ? 'lista gravada' : 'falta o agente gravar a lista',
      isDone: competitorsCount > 0,
      isCurrent: competitorsCount === 0,
    },
    {
      title: 'Aprovação',
      hint: isApproved ? 'aprovada' : 'falta você conferir',
      isDone: isApproved,
      isCurrent: competitorsCount > 0 && !isApproved,
    },
    {
      title: 'Pesquisa inicial',
      hint: isApproved ? 'prompt liberado' : 'libera após a aprovação',
      isDone: false,
      isCurrent: isApproved,
    },
  ]
}

function buildTitle(isApproved: boolean, competitorsCount: number): string {
  if (isApproved) return 'Lista aprovada'
  return competitorsCount === 0 ? 'Sem lista de concorrentes' : 'Lista aguardando sua aprovação'
}

type DescriptionInput = {
  isApproved: boolean
  competitorsCount: number
  activeCount: number
  markedCount: number
}

function buildDescription({ isApproved, competitorsCount, activeCount, markedCount }: DescriptionInput): string {
  const activeLabel = activeCount === 1 ? '1 concorrente entra' : `${activeCount} concorrentes entram`
  const markedLabel = markedCount === 1 ? '1 marcado' : `${markedCount} marcados`

  if (isApproved) {
    return `${activeLabel} na pesquisa inicial, principais primeiro e com mais peso. ${markedLabel} como “Não é concorrente” ficam de fora. Copie o prompt 2 e cole no Claude Code.`
  }
  if (competitorsCount === 0) {
    return 'Copie o prompt 1 e cole no Claude Code. Quando o agente gravar a lista, ela aparece aqui para você conferir e aprovar.'
  }
  return `Confira os ${competitorsCount} cartões: ${activeLabel} na análise e ${markedLabel} como “Não é concorrente”. Marque o que estiver errado e aprove; só então o prompt da pesquisa inicial é liberado.`
}

function buildBlockedReason(competitorsCount: number, activeCount: number): string | null {
  if (competitorsCount === 0) return 'Não há lista de concorrentes para aprovar: copie o prompt 1 para o agente gravar a lista.'
  if (activeCount === 0) return 'Todos os concorrentes estão marcados como “Não é concorrente”: desfaça ao menos uma marca para aprovar a lista.'
  return null
}

export function ApprovalBar({
  approval,
  competitorsCount,
  activeCount,
  markedCount,
  isPending,
  onApprove,
  onReopen,
}: ApprovalBarProps) {
  const isApproved = approval === CompetitorApproval.APPROVED
  const steps = buildSteps(isApproved, competitorsCount)
  const blockedReason = isApproved ? null : buildBlockedReason(competitorsCount, activeCount)

  return (
    <section aria-label="Etapa" className="mt-5 rounded-3 bg-card px-6 py-5 shadow-1">
      <ol className="grid list-none grid-cols-3 gap-3">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className={cn(
              'flex items-center gap-2.5 border-b-[3px] pb-3 text-[13.5px] font-semibold',
              step.isDone && 'border-support text-support',
              step.isCurrent && 'border-brand text-ink',
              !step.isDone && !step.isCurrent && 'border-line text-ink-3',
            )}
          >
            <span className="grid size-6 place-items-center rounded-full bg-[#ececea] text-[12.5px] font-extrabold">
              {step.isDone ? '✓' : index + 1}
            </span>
            <span>
              {step.title}
              <small className="block text-[12.5px] font-normal text-ink-3">{step.hint}</small>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <div className="min-w-[300px] flex-1">
          <h2 className="text-[21px] font-bold tracking-[-0.01em]">{buildTitle(isApproved, competitorsCount)}</h2>
          <p className="mt-1.5 max-w-[640px] text-[14.5px] leading-normal text-ink-2">
            {buildDescription({ isApproved, competitorsCount, activeCount, markedCount })}
          </p>
        </div>
        {isApproved ? (
          <Button variant="secondary" disabled={isPending} onClick={onReopen}>
            Reabrir lista
          </Button>
        ) : (
          <div className="grid justify-items-start gap-1.5">
            <Button
              disabled={isPending || blockedReason !== null}
              aria-describedby={blockedReason === null ? undefined : BLOCKED_REASON_ID}
              onClick={onApprove}
            >
              Aprovar lista
            </Button>
            {blockedReason !== null && (
              <p id={BLOCKED_REASON_ID} className="max-w-[300px] text-[12.5px] leading-snug text-attention">
                {blockedReason}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
