import { describe, expect, it } from 'vitest'
import { buildReadingPrompt } from '@/layout/utils/prompts/build-reading-prompt'

const PROJECT_ID = '3f1c2a9e-7b4d-4e0a-9d51-0c6a8e2b7f14'
const API_URL = 'http://127.0.0.1:7341'
const PROJECT_URL = `${API_URL}/projects/${PROJECT_ID}`

describe('buildReadingPrompt', () => {
  const prompt = buildReadingPrompt({ projectId: PROJECT_ID, apiUrl: API_URL })

  it('carries the project code and the API address', () => {
    expect(prompt).toContain(PROJECT_ID)
    expect(prompt).toContain(`GET ${PROJECT_URL}`)
  })

  it('uses the values of the given project and API address', () => {
    const otherPrompt = buildReadingPrompt({
      projectId: 'other-project',
      apiUrl: 'http://127.0.0.1:4444',
    })

    expect(otherPrompt).toContain('GET http://127.0.0.1:4444/projects/other-project')
    expect(otherPrompt).not.toContain(PROJECT_ID)
  })

  it('asks to read the basics, list, read the channel ones and only then create, in this order', () => {
    const basicsStep = prompt.indexOf(`com GET ${PROJECT_URL}.`)
    const listStep = prompt.indexOf(`com GET ${PROJECT_URL}/documents.`)
    const readStep = prompt.indexOf(`com GET ${PROJECT_URL}/documents/{slug}`)
    const createStep = prompt.indexOf('Só então crie o conteúdo')

    expect(basicsStep).toBeGreaterThanOrEqual(0)
    expect(listStep).toBeGreaterThan(basicsStep)
    expect(readStep).toBeGreaterThan(listStep)
    expect(createStep).toBeGreaterThan(readStep)
  })

  it('names the channels whose documents are relevant', () => {
    expect(prompt).toContain('SEO, Instagram, Facebook, TikTok e similares')
  })

  it('warns that nothing was collected and suggests the collection prompt when the list is empty', () => {
    expect(prompt).toContain('Se a lista de documentos vier vazia')
    expect(prompt).toContain('ainda não há nada coletado')
    expect(prompt).toContain('rodar o prompt de coleta')
  })

  it('says which document is missing, without inventing, when none fits the channel', () => {
    expect(prompt).toContain('Se nenhum documento for relevante ao canal pedido, diga qual documento falta')
    expect(prompt).toContain('Não invente')
  })
})
