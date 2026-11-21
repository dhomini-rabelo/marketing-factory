import { Link, useParams } from 'react-router'
import { SeoContent } from '@/pages/seo/components/seo-content'
import { SeoTabProvider } from '@/pages/seo/components/seo-tab-provider'

export function SeoPage() {
  const { projectId = '' } = useParams()

  return (
    <SeoTabProvider>
      <div className="px-9 pb-10 pt-7">
        <nav aria-label="Caminho" className="mb-2 text-[13px] text-ink-3">
          <Link to={`/projects/${projectId}`} className="text-ink-2">
            Projeto
          </Link>
          {' / Pesquisa inicial / SEO e blog'}
        </nav>
        <h1 className="font-brand text-[34px] font-extrabold leading-tight tracking-[-0.025em]">SEO e blog</h1>
        <SeoContent />
      </div>
    </SeoTabProvider>
  )
}
