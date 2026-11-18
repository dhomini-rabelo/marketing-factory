import { createElement, type ReactNode } from 'react'
import type { Components } from 'react-markdown'

type StyledTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'ul' | 'ol' | 'strong' | 'em' | 'code' | 'blockquote'

type StyledElementProps = {
  children?: ReactNode
}

const TAG_CLASSES: Record<StyledTag, string> = {
  h1: 'mb-2 mt-4 font-brand text-xl font-bold',
  h2: 'mb-2 mt-4 text-lg font-bold',
  h3: 'mb-1.5 mt-3.5 text-base font-bold',
  h4: 'mb-1 mt-3 text-sm font-bold text-ink-2',
  'p': 'my-2',
  ul: 'my-2 list-disc pl-5',
  ol: 'my-2 list-decimal pl-5',
  strong: 'font-bold',
  em: 'italic',
  code: 'rounded-1 bg-code-bg px-1 py-0.5 font-mono text-[0.9em] text-code-text',
  blockquote: 'my-2 border-l-4 border-brand pl-3 text-ink-2',
}

function styledElement(tag: StyledTag) {
  return function StyledElement({ children }: StyledElementProps) {
    return createElement(tag, { className: TAG_CLASSES[tag] }, children)
  }
}

export const MARKDOWN_COMPONENTS: Components = {
  h1: styledElement('h1'),
  h2: styledElement('h2'),
  h3: styledElement('h3'),
  h4: styledElement('h4'),
  'p': styledElement('p'),
  ul: styledElement('ul'),
  ol: styledElement('ol'),
  strong: styledElement('strong'),
  em: styledElement('em'),
  code: styledElement('code'),
  blockquote: styledElement('blockquote'),
}
