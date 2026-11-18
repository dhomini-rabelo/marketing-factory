import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/layout/components/common/app-shell'

const HomePage = lazy(() => import('@/pages/home/page').then((module) => ({ default: module.HomePage })))
const NewProjectPage = lazy(() =>
  import('@/pages/new-project/page').then((module) => ({ default: module.NewProjectPage })),
)
const ProjectPage = lazy(() =>
  import('@/pages/project/page').then((module) => ({ default: module.ProjectPage })),
)
const ChannelPage = lazy(() =>
  import('@/pages/channel/page').then((module) => ({ default: module.ChannelPage })),
)
const CompetitorsPage = lazy(() =>
  import('@/pages/competitors/page').then((module) => ({ default: module.CompetitorsPage })),
)

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/projects/new', element: <NewProjectPage /> },
      { path: '/projects/:projectId', element: <ProjectPage /> },
      { path: '/projects/:projectId/channels/:channel', element: <ChannelPage /> },
      { path: '/projects/:projectId/competitors', element: <CompetitorsPage /> },
    ],
  },
])
