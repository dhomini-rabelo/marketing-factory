import { describe, expect, it } from 'vitest'
import { buildCollectionPrompt } from '@/layout/utils/prompts/build-collection-prompt'

const PROJECT_ID = '3f1c2a9e-7b4d-4e0a-9d51-0c6a8e2b7f14'
const API_URL = 'http://127.0.0.1:7341'
const CATEGORIES = [
  'Visão geral do produto',
  'Features importantes e de média importância',
  'Público e dores',
  'Proposta de valor e diferenciais',
  'Concorrentes',
  'Tom de voz e exemplos',
  'Provas (depoimentos, números, preços e planos)',
  'Canais, links e ativos',
  'SEO (palavras-chave e temas)',
  'Restrições (o que não dizer)',
]

describe('buildCollectionPrompt', () => {
  const prompt = buildCollectionPrompt({ projectId: PROJECT_ID, apiUrl: API_URL })

  it('carries the project code and the API address of the documents route', () => {
    expect(prompt).toContain(PROJECT_ID)
    expect(prompt).toContain(`PUT ${API_URL}/projects/${PROJECT_ID}/documents`)
  })

  it('uses the values of the given project and API address', () => {
    const otherPrompt = buildCollectionPrompt({
      projectId: 'other-project',
      apiUrl: 'http://127.0.0.1:4444',
    })

    expect(otherPrompt).toContain('PUT http://127.0.0.1:4444/projects/other-project/documents')
    expect(otherPrompt).not.toContain(PROJECT_ID)
  })

  it('asks the agent to investigate the open folder of a cloned repository', () => {
    expect(prompt).toContain('aberto na pasta de um repositório clonado')
    expect(prompt).toContain('Investigue esta pasta')
  })

  it('lists the 10 categories with their exact names', () => {
    expect(prompt).toContain('Cubra estas 10 categorias')
    CATEGORIES.forEach((category, index) => {
      expect(prompt).toContain(`${index + 1}. ${category}`)
    })
  })

  it('asks to split the findings into short documents by subject', () => {
    expect(prompt).toContain('vários documentos curtos, um por assunto')
    expect(prompt).toContain('features importantes e features de média importância ficam em documentos separados')
  })

  it('asks to save each document by title, so running again updates instead of copying', () => {
    expect(prompt).toContain('{"title": "...", "description": "...", "body": "..."}')
    expect(prompt).toContain('mesmo título atualiza o documento que já existe, sem criar cópia')
  })

  it('asks for a short description in every document', () => {
    expect(prompt).toContain('description: uma descrição curta do documento')
  })

  it('asks to record "não encontrado no repositório" without inventing', () => {
    expect(prompt).toContain('"não encontrado no repositório"')
    expect(prompt).toContain('Não invente')
  })

  it('allows the product to be at an early stage', () => {
    expect(prompt).toContain('fase inicial')
  })
})
