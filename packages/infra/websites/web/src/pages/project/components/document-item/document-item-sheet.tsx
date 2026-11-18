import { formatDate } from '@/pages/project/utils/format-date'

type DocumentItemSheetProps = {
  createdAt: string
  updatedAt: string
}

export function DocumentItemSheet({ createdAt, updatedAt }: DocumentItemSheetProps) {
  return (
    <dl className="border-l border-line pl-4 text-[13px]">
      <dt className="text-xs text-ink-3">Criado em</dt>
      <dd className="mb-3 font-semibold">{formatDate(createdAt)}</dd>
      <dt className="text-xs text-ink-3">Atualizado em</dt>
      <dd className="font-semibold">{formatDate(updatedAt)}</dd>
    </dl>
  )
}
