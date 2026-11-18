import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type DocumentItemMarkdownProps = {
  body: string
}

const MARKDOWN_CLASSES = [
  'max-w-155 text-sm leading-[1.6]',
  '[&_h3]:mb-1.5 [&_h3]:mt-3.5 [&_h3]:text-base [&_h3]:font-bold',
  '[&_h4]:mb-1 [&_h4]:mt-3 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-ink-2',
  '[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_a]:text-brand [&_a]:underline',
].join(' ')

function ExternalLink({ href, children }: ComponentProps<'a'>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export function DocumentItemMarkdown({ body }: DocumentItemMarkdownProps) {
  return (
    <div className={MARKDOWN_CLASSES}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ 'a': ExternalLink }}>
        {body}
      </ReactMarkdown>
    </div>
  )
}
