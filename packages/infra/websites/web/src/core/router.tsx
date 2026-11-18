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

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/projects/new', element: <NewProjectPage /> },
      { path: '/projects/:projectId', element: <ProjectPage /> },
    ],
  },
])
