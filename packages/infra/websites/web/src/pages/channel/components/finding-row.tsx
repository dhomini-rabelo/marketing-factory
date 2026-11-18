import { FindingKind } from '@/api/models/channel-analysis'
import { ROLE_KEYS } from '@/layout/utils/competitor-analysis/keys'
import { isHttpUrl } from '@/pages/channel/utils/is-http-url'
import type { GroupedFinding } from '@/pages/channel/utils/group-findings-by-aspect'

type FindingRowProps = {
  grouped: GroupedFinding
}

function FindingSource({ url, tool }: { url: string; tool: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-3">
      {isHttpUrl(url) ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 break-all border-b border-[#c7c8f7] font-semibold text-brand"
        >
          {url}
        </a>
      ) : (
        <span className="break-all">{url}</span>
      )}
      {tool && <span className="rounded-[4px] bg-code-bg px-1.5 font-mono text-[11.5px] text-ink-2">{tool}</span>}
    </div>
  )
}

export function FindingRow({ grouped }: FindingRowProps) {
  const { finding, competitorName, role } = grouped
  const isFact = finding.kind === FindingKind.FACT
  const roleLabel = ROLE_KEYS.find((item) => item.key === role)?.label

  return (
    <li
      data-kind={finding.kind}
      className={
        isFact
          ? 'grid gap-4 border-t border-line px-[18px] py-3.5 first:border-t-0 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,0.8fr)]'
          : 'grid gap-4 border-t border-line bg-[#fffaf1] px-[18px] py-3.5 first:border-t-0 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,0.8fr)]'
      }
    >
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="break-words text-sm font-bold">{competitorName}</span>
        {roleLabel && (
          <span className="rounded-full border border-line px-[7px] py-[3px] text-[10.5px] font-semibold leading-none text-ink-3">
            {roleLabel}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <span
          className={isFact ? 'rounded-full bg-[#dff3ec] px-2.5 py-[3px] text-xs font-bold text-support' : 'rounded-full border border-dashed border-[#d9b36a] bg-[#fffaf1] px-2.5 py-[3px] text-xs font-bold text-attention'}
        >
          {isFact ? 'Fato' : 'Hipótese'}
        </span>
        <p className="mt-1.5 break-words text-sm leading-normal">{finding.statement}</p>
      </div>
      {isFact && (finding.excerpt || finding.url) && (
        <div className="grid min-w-0 content-start gap-1.5 border-l-[3px] border-support pl-3.5">
          {finding.excerpt && <blockquote className="break-words text-[12.5px] text-ink-2">{finding.excerpt}</blockquote>}
          {finding.url && <FindingSource url={finding.url} tool={finding.tool} />}
        </div>
      )}
    </li>
  )
}
