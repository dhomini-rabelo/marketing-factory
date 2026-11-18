import type { ComponentProps } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MARKDOWN_COMPONENTS } from '@/pages/project/components/document-item/document-item-markdown-components'

type DocumentItemMarkdownProps = {
  body: string
}

const MARKDOWN_CLASSES = 'max-w-155 text-sm leading-[1.6]'

function ExternalLink({ href, children }: ComponentProps<'a'>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-brand underline">
      {children}
    </a>
  )
}

const COMPONENTS: Components = { ...MARKDOWN_COMPONENTS, 'a': ExternalLink }

export function DocumentItemMarkdown({ body }: DocumentItemMarkdownProps) {
  return (
    <div className={MARKDOWN_CLASSES}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {body}
      </ReactMarkdown>
    </div>
  )
}
