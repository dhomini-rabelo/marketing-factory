import type { SeoRoundCompetitor } from '@/api/models/seo'
import { TopicRow } from '@/pages/seo/components/overview/topic-row'
import { formatCount } from '@/pages/seo/utils/format-count'
import { formatNumber } from '@/pages/seo/utils/format-number'
import { buildNoTopicsMessage, MAX_VISIBLE_TOPICS, readBlogPosts, readTopics } from '@/pages/seo/utils/seo-topics'

type TopicCardProps = {
  competitor: SeoRoundCompetitor
}

function formatBlogPosts(count: number): string {
  return formatCount(count, 'post', 'posts')
}

export function TopicCard({ competitor }: TopicCardProps) {
  const topics = readTopics(competitor.clusters)
  const blogPosts = readBlogPosts(competitor.profile)

  return (
    <article data-competitor={competitor.name} className="grid min-w-0 content-start gap-2 rounded-2 border border-line p-3.5">
      <h4 className="text-[13px] font-bold">{competitor.name}</h4>
      {topics.length === 0 ? (
        <p className="text-[13px] text-ink-3">{buildNoTopicsMessage(blogPosts, formatBlogPosts)}</p>
      ) : (
        <ul className="grid gap-2">
          {topics.slice(0, MAX_VISIBLE_TOPICS).map((topic) => (
            <TopicRow key={topic.theme} topic={topic} blogPosts={blogPosts} />
          ))}
        </ul>
      )}
      {topics.length > MAX_VISIBLE_TOPICS && (
        <p className="text-[12px] text-ink-3">{formatNumber(topics.length - MAX_VISIBLE_TOPICS)} temas a mais na aba dele</p>
      )}
    </article>
  )
}
