import { NotMeasured } from '@/pages/seo/components/overview/not-measured'
import { formatDecimal, formatNumber } from '@/pages/seo/utils/format-number'
import type { SeoSampleItem } from '@/pages/seo/utils/seo-items'
import { describeMissingReason, type LimitReasonKey } from '@/pages/seo/utils/seo-limits'
import { readProfileNumber } from '@/pages/seo/utils/seo-profile'
import { NUMBER_CELL_CLASS } from '@/pages/seo/utils/table-styles'

type ItemNumberCellProps = {
  item: SeoSampleItem
  field: string
  reasonKey: LimitReasonKey
  limits: string
  isDecimal?: boolean
}

export function ItemNumberCell({ item, field, reasonKey, limits, isDecimal = false }: ItemNumberCellProps) {
  const value = readProfileNumber(item.record, field)

  return (
    <td className={NUMBER_CELL_CLASS}>
      {value === null ? (
        <NotMeasured reason={describeMissingReason(limits, reasonKey)} />
      ) : isDecimal ? (
        formatDecimal(value)
      ) : (
        formatNumber(value)
      )}
    </td>
  )
}
