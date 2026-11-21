import { useState } from 'react'
import { TopicExampleRow } from '@/pages/seo/components/competitor/topic-example-row'
import { formatCount } from '@/pages/seo/utils/format-count'
import { VISIBLE_EXAMPLES, type TopicExamples } from '@/pages/seo/utils/seo-examples'
import { HEAD_CELL_CLASS, NUMBER_HEAD_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type TopicExampleGroupProps = {
  group: TopicExamples
  isOpenByDefault: boolean
}

export function TopicExampleGroup({ group, isOpenByDefault }: TopicExampleGroupProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const total = group.examples.length
  const visibleExamples = isExpanded ? group.examples : group.examples.slice(0, VISIBLE_EXAMPLES)

  return (
    <details open={isOpenByDefault} data-topic={group.topic} className="border-t border-line first:border-t-0">
      <summary className="flex cursor-pointer items-baseline gap-2.5 px-4 py-1.5 text-[13.5px] font-bold">
        {group.topic} <small className="font-medium text-ink-3">{formatCount(total, 'exemplo', 'exemplos')}</small>
      </summary>
      {total === 0 ? (
        <p className="px-4 pb-2 text-xs text-ink-3">Sem exemplo copiado para este tema.</p>
      ) : (
        <table className="w-full table-fixed border-collapse text-[13px]">
          <colgroup>
            <col />
            <col className="w-[110px]" />
            <col className="w-[190px]" />
            <col className="w-[190px]" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className={HEAD_CELL_CLASS}>Título e resumo do card</th>
              <th scope="col" className={NUMBER_HEAD_CELL_CLASS}>Data</th>
              <th scope="col" className={HEAD_CELL_CLASS}>Autor</th>
              <th scope="col" className={HEAD_CELL_CLASS}>Público</th>
            </tr>
          </thead>
          <tbody>
            {visibleExamples.map((example) => (
              <TopicExampleRow key={example.url} example={example} />
            ))}
          </tbody>
        </table>
      )}
      {total > VISIBLE_EXAMPLES && (
        <div className="px-4 py-2">
          <button type="button" className="text-xs font-semibold text-brand" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'ver menos' : `ver todos (${total})`}
          </button>
        </div>
      )}
    </details>
  )
}
