import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Suspense, type ReactElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { createQueryClient } from '@/core/query-client'

type RenderWithProvidersOptions = {
  initialEntry?: string
  routePath?: string
}

export function renderWithProviders(
  ui: ReactElement,
  { initialEntry = '/', routePath }: RenderWithProvidersOptions = {},
) {
  const queryClient = createQueryClient()
  const content = routePath ? (
    <Routes>
      <Route path={routePath} element={ui} />
    </Routes>
  ) : (
    ui
  )

  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Suspense fallback={null}>{content}</Suspense>
      </MemoryRouter>
    </QueryClientProvider>,
  )

  return { ...view, queryClient, user: userEvent.setup() }
}
