import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { TopicRow } from '@/pages/seo/components/overview/topic-row'
import { formatCount } from '@/pages/seo/utils/format-count'
import { buildNoTopicsMessage, readBlogPosts, readTopics } from '@/pages/seo/utils/seo-topics'

type CompetitorTopicsProps = {
  clusters: object[]
  profile: Record<string, unknown>
  limits: string
}

function formatBlogPosts(count: number): string {
  return formatCount(count, 'post', 'posts')
}

export function CompetitorTopics({ clusters, profile, limits }: CompetitorTopicsProps) {
  const topics = readTopics(clusters)
  const blogPosts = readBlogPosts(profile)

  return (
    <OverviewSection position={13} title="Temas do blog" note="todos os temas contados · páginas do blog cujo endereço contém o termo">
      {topics.length === 0 ? (
        <CompetitorEmpty message={buildNoTopicsMessage(blogPosts, formatBlogPosts)} limits={limits} />
      ) : (
        <ul className="grid gap-2 px-5 pb-5 pt-1">
          {topics.map((topic) => (
            <TopicRow key={topic.theme} topic={topic} blogPosts={blogPosts} />
          ))}
        </ul>
      )}
    </OverviewSection>
  )
}
