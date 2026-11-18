import { useParams } from 'react-router'
import { DocumentsSection } from '@/pages/project/components/documents-section/documents-section'
import { ProjectBasics } from '@/pages/project/components/project-basics/project-basics'
import { PromptsPanel } from '@/pages/project/components/prompts-panel/prompts-panel'

export function ProjectPage() {
  const { projectId = '' } = useParams()

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-7 px-9 pb-10 pt-7">
      <div className="col-span-full">
        <ProjectBasics projectId={projectId} />
      </div>
      <DocumentsSection projectId={projectId} />
      <div className="sticky top-6 col-start-2 row-start-2">
        <PromptsPanel projectId={projectId} />
      </div>
    </div>
  )
}
