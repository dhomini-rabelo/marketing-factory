import { AspectBlock } from '@/pages/channel/components/aspect-block'
import { ChannelEmpty } from '@/pages/channel/components/channel-empty'
import type { FindingsByAspect as FindingsByAspectModel } from '@/pages/channel/utils/group-findings-by-aspect'

type FindingsByAspectProps = {
  findingsByAspect: FindingsByAspectModel
}

export function FindingsByAspect({ findingsByAspect }: FindingsByAspectProps) {
  return (
    <section aria-label="Achados" className="grid gap-3.5">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-xl font-bold tracking-[-0.01em]">Achados</h2>
        <span className="text-[13.5px] text-ink-3">uma lista por aspecto, o concorrente aparece em cada achado</span>
      </div>
      {findingsByAspect.blocks.length === 0 ? (
        <ChannelEmpty />
      ) : (
        findingsByAspect.blocks.map((block) => <AspectBlock key={block.aspect} block={block} />)
      )}
    </section>
  )
}
