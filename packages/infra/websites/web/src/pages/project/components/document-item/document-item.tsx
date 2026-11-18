import { useState } from 'react'
import type { DocumentSummary } from '@/api/models/document'
import { cn } from '@/layout/utils/styles'
import { DocumentItemBody } from '@/pages/project/components/document-item/document-item-body'
import { formatDate, isToday } from '@/pages/project/utils/format-date'

type DocumentItemProps = {
  projectId: string
  document: DocumentSummary
}

export function DocumentItem({ projectId, document }: DocumentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <li className="border-b border-line last:border-b-0">
      <button
        type="button"
        aria-expanded={isExpanded}
        className={cn(
          'grid w-full grid-cols-[1fr_92px_16px] items-center gap-3.5 px-5 py-3.5 text-left hover:bg-hover',
          isExpanded && 'bg-brand-soft hover:bg-brand-soft',
        )}
        onClick={() => setIsExpanded((current) => !current)}
      >
        <span className="min-w-0">
          <span className="block font-semibold">{document.title}</span>
          <span className="block text-[13px] text-ink-2">{document.description}</span>
        </span>
        <span
          className={cn(
            'text-xs text-ink-3',
            isToday(document.updatedAt) && 'font-bold text-support',
          )}
        >
          {formatDate(document.updatedAt)}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className={cn('size-4 text-ink-3 transition-transform', isExpanded && 'rotate-90')}
        >
          <path
            d="M6 3l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isExpanded && <DocumentItemBody projectId={projectId} slug={document.slug} />}
    </li>
  )
}
