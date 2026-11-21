import { useState, type ReactNode } from 'react'
import { SeoTabContext } from '@/pages/seo/contexts/seo-tab-context'
import { SEO_OVERVIEW_TAB } from '@/pages/seo/utils/seo-tab'

type SeoTabProviderProps = {
  children: ReactNode
}

export function SeoTabProvider({ children }: SeoTabProviderProps) {
  const [activeTab, setActiveTab] = useState(SEO_OVERVIEW_TAB)

  return <SeoTabContext.Provider value={{ activeTab, setActiveTab }}>{children}</SeoTabContext.Provider>
}
