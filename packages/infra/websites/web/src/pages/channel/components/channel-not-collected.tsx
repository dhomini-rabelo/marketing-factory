import { Link } from 'react-router'

type ChannelNotCollectedProps = {
  channelName: string
  projectId: string
}

export function ChannelNotCollected({ channelName, projectId }: ChannelNotCollectedProps) {
  return (
    <div className="px-9 pb-10 pt-7">
      <h1 className="font-brand text-[34px] font-extrabold tracking-[-0.025em]">{channelName}</h1>
      <p className="mt-3 text-base text-ink-2">Este canal ainda não foi coletado.</p>
      <p className="mt-1.5 text-sm text-ink-2">O prompt da pesquisa inicial está na página do projeto.</p>
      <Link
        to={`/projects/${projectId}`}
        className="mt-4 inline-block rounded-2 bg-card px-3.5 py-2 text-sm font-semibold shadow-1"
      >
        Voltar ao projeto
      </Link>
    </div>
  )
}
