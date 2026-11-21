import { formatDecimal, formatNumber } from '@/pages/seo/utils/format-number'
import { calculateTopicShare, type SeoTopic } from '@/pages/seo/utils/seo-topics'

type TopicRowProps = {
  topic: SeoTopic
  blogPosts: number
}

export function TopicRow({ topic, blogPosts }: TopicRowProps) {
  const share = calculateTopicShare(topic.pages, blogPosts)
  const barHint = `${formatNumber(topic.pages)} de ${formatNumber(blogPosts)} posts do blog (${formatDecimal(share)}%) · termo contado nos endereços: ${topic.term}`

  return (
    <li className="grid min-w-0 grid-cols-[1fr_auto_80px] items-center gap-2 text-[13px]">
      <span className="truncate">{topic.theme}</span>
      <b className="tabular-nums">{formatNumber(topic.pages)}</b>
      <span title={barHint} className="h-1.5 overflow-hidden rounded-full bg-line">
        <i className="block h-full bg-brand" style={{ width: `${share}%` }} />
      </span>
      <small className="col-span-3 text-[11.5px] text-ink-3">
        termo <code className="font-mono">{topic.term}</code> ·{' '}
        <a href={topic.exampleUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
          exemplo
        </a>
      </small>
    </li>
  )
}
