import { createContext, useContext } from 'react'
import { SEO_OVERVIEW_TAB } from '@/pages/seo/utils/seo-tab'

type SeoTabContextValue = {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export const SeoTabContext = createContext<SeoTabContextValue>({
  activeTab: SEO_OVERVIEW_TAB,
  setActiveTab: () => undefined,
})

export function useSeoTab() {
  const { activeTab, setActiveTab } = useContext(SeoTabContext)

  return {
    state: { activeTab },
    actions: { setActiveTab },
  }
}
