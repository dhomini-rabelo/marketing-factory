import { CompetitorEmpty } from '@/pages/seo/components/competitor/competitor-empty'
import { OverviewSection } from '@/pages/seo/components/overview/overview-section'
import { formatNumber } from '@/pages/seo/utils/format-number'
import type { SeoFolder } from '@/pages/seo/utils/seo-items'

type SeriesFoldersProps = {
  folders: SeoFolder[]
}

export function SeriesFolders({ folders }: SeriesFoldersProps) {
  const maxPages = Math.max(1, ...folders.map((folder) => folder.pages))

  return (
    <OverviewSection position={10} title="Pastas em série" note="páginas por pasta fora do blog">
      {folders.length === 0 ? (
        <CompetitorEmpty message="Nenhuma pasta fora do blog com 5 páginas ou mais." limits="" />
      ) : (
        <ul className="px-4 py-2">
          {folders.map((folder) => (
            <li key={folder.folder} data-folder={folder.folder} className="flex items-center gap-2.5 py-0.5 text-[13px]">
              <code className="w-52 truncate font-mono text-xs">{folder.folder}</code>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <i className="block h-full bg-brand" style={{ width: `${(folder.pages / maxPages) * 100}%` }} />
              </span>
              <b className="min-w-10 text-right tabular-nums">{formatNumber(folder.pages)}</b>
            </li>
          ))}
        </ul>
      )}
    </OverviewSection>
  )
}
