import { formatComparisonFormat, formatRivals, type SeoComparison } from '@/pages/seo/utils/seo-comparisons'

type ComparisonsTableProps = {
  comparisons: SeoComparison[]
}

export function ComparisonsTable({ comparisons }: ComparisonsTableProps) {
  return (
    <table className="w-full border-collapse text-left text-[13px]">
      <thead>
        <tr className="text-[11.5px] text-ink-3">
          <th className="py-1.5 pr-3 font-semibold">Slug</th>
          <th className="py-1.5 pr-3 font-semibold">Rivais</th>
          <th className="py-1.5 pr-3 font-semibold">Formato</th>
          <th className="py-1.5 font-semibold">Link</th>
        </tr>
      </thead>
      <tbody>
        {comparisons.map((comparison) => (
          <tr key={comparison.url} className="border-t border-line">
            <td className="py-1.5 pr-3 font-bold">{comparison.slug}</td>
            <td className="py-1.5 pr-3">{formatRivals(comparison.rivals)}</td>
            <td className="py-1.5 pr-3">{formatComparisonFormat(comparison.format)}</td>
            <td className="py-1.5">
              <a href={comparison.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand">
                abrir
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
