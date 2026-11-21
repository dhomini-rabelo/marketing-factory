import { formatSearchDate, formatSearchResults, type SeoSearch } from '@/pages/seo/utils/seo-searches'

type SearchesTableProps = {
  searches: SeoSearch[]
}

export function SearchesTable({ searches }: SearchesTableProps) {
  return (
    <div className="overflow-x-auto px-5 pb-4">
      <table className="w-full border-collapse text-left text-[13px]">
        <thead>
          <tr className="text-[11.5px] text-ink-3">
            <th className="py-1.5 pr-3 font-semibold">Busca</th>
            <th className="py-1.5 pr-3 font-semibold">Mercado</th>
            <th className="py-1.5 pr-3 font-semibold">Data</th>
            <th className="py-1.5 pr-3 font-semibold">Ferramenta</th>
            <th className="py-1.5 font-semibold">Resultados</th>
          </tr>
        </thead>
        <tbody>
          {searches.map((search) => (
            <tr key={`${search.query}-${search.searchedAt}`} className="border-t border-line">
              <td className="py-1.5 pr-3">{search.query}</td>
              <td className="py-1.5 pr-3">{search.market}</td>
              <td className="py-1.5 pr-3">{formatSearchDate(search.searchedAt)}</td>
              <td className="py-1.5 pr-3">{search.searchTool}</td>
              <td className="py-1.5">{formatSearchResults(search.results)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
