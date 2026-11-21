import { formatSeoDate } from '@/pages/seo/utils/format-seo-date'
import type { SeoSampleItem } from '@/pages/seo/utils/seo-items'

type SampleItemLabelProps = {
  item: SeoSampleItem
}

export function SampleItemLabel({ item }: SampleItemLabelProps) {
  return (
    <>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block font-semibold text-brand">
        {item.title}
      </a>
      <span className="block text-[11px] text-ink-3">
        {item.pageTypeLabel} {item.roleLabel} · {item.publishedAt ? formatSeoDate(item.publishedAt) : 'sem data real'}
      </span>
    </>
  )
}
