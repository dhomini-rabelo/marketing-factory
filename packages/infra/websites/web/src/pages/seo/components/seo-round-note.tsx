import { useState } from 'react'
import { cn } from '@/layout/utils/styles'

const NOTE_PREVIEW_LIMIT = 200

type SeoRoundNoteProps = {
  note: string
}

export function SeoRoundNote({ note }: SeoRoundNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = note.length > NOTE_PREVIEW_LIMIT

  return (
    <p className="mt-0.5 text-xs leading-snug text-ink-3">
      <span className={cn(isLong && !isExpanded && 'line-clamp-2')}>{note}</span>
      {isLong && (
        <button
          type="button"
          aria-expanded={isExpanded}
          className="cursor-pointer font-semibold text-ink-2 underline"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? 'ver menos' : 'ver mais'}
        </button>
      )}
    </p>
  )
}
