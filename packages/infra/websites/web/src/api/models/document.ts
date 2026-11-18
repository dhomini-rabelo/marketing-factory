export type Document = {
  slug: string
  title: string
  description: string
  body: string
  createdAt: string
  updatedAt: string
}

export type DocumentSummary = Pick<Document, 'slug' | 'title' | 'description' | 'updatedAt'>
