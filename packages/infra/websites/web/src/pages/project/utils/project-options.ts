import { ProjectPhase, ProjectPlatform } from '@/api/models/project'
import type { ChoiceOption } from '@/layout/components/forms/choice-field'

export const PLATFORM_OPTIONS: ChoiceOption[] = [
  { value: ProjectPlatform.WEB, label: 'Web', hint: 'roda no navegador' },
  { value: ProjectPlatform.MOBILE, label: 'Mobile', hint: 'app iOS ou Android' },
  { value: ProjectPlatform.BOTH, label: 'Web + mobile', hint: 'os dois' },
]

export const PHASE_OPTIONS: ChoiceOption[] = [
  { value: ProjectPhase.NO_CUSTOMERS, label: 'Sem clientes', hint: 'ainda não vendeu' },
  {
    value: ProjectPhase.FINDING_MARKET_FIT,
    label: 'Buscando espaço no mercado',
    hint: 'tem clientes, quer mais',
  },
  { value: ProjectPhase.CONSOLIDATED, label: 'Produto consolidado', hint: 'vende com constância' },
]
