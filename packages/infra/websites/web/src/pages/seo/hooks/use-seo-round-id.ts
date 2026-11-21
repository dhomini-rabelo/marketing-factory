import { useSearchParams } from 'react-router'

const ROUND_PARAM = 'round'
const LATEST_ROUND = 'latest'

export function useSeoRoundId() {
  const [searchParams, setSearchParams] = useSearchParams()

  function setRoundId(roundId: string) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set(ROUND_PARAM, roundId)
    setSearchParams(nextParams)
  }

  return {
    state: { roundId: searchParams.get(ROUND_PARAM) ?? LATEST_ROUND },
    actions: { setRoundId },
  }
}
