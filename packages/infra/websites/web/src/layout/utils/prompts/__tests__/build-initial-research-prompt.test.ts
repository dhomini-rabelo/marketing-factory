import { describe, expect, it } from 'vitest'
import { buildInitialResearchPrompt } from '@/layout/utils/prompts/build-initial-research-prompt'

const PROJECT_ID = '3f1c2a9e-7b4d-4e0a-9d51-0c6a8e2b7f14'
const API_URL = 'http://127.0.0.1:7341'
const CHANNELS = [
  ['seo', 'SEO e blog'],
  ['site-pricing', 'Site e preço'],
  ['linkedin', 'LinkedIn'],
  ['instagram', 'Instagram'],
  ['youtube', 'YouTube'],
  ['x', 'X'],
  ['tiktok', 'TikTok'],
  ['reddit', 'Reddit'],
  ['ads', 'Anúncios'],
]

describe('buildInitialResearchPrompt', () => {
  const prompt = buildInitialResearchPrompt({ projectId: PROJECT_ID, apiUrl: API_URL })

  it('carries the project code and the API address of the channels route', () => {
    expect(prompt).toContain(PROJECT_ID)
    expect(prompt).toContain(`PUT ${API_URL}/projects/${PROJECT_ID}/channels/{canal}`)
  })

  it('uses the values of the given project and API address', () => {
    const otherPrompt = buildInitialResearchPrompt({
      projectId: 'other-project',
      apiUrl: 'http://127.0.0.1:4444',
    })

    expect(otherPrompt).toContain('PUT http://127.0.0.1:4444/projects/other-project/channels/{canal}')
    expect(otherPrompt).not.toContain(PROJECT_ID)
    expect(otherPrompt).not.toContain(API_URL)
  })

  it('asks to read the list and its approval before anything else', () => {
    expect(prompt).toContain(`GET ${API_URL}/projects/${PROJECT_ID}/competitors`)
    expect(prompt).toContain('"approval" ("approved" ou "pending")')
  })

  it('asks to stop without saving any channel when there is no approved list with an unmarked competitor', () => {
    expect(prompt).toContain('Se a lista não estiver aprovada ou não tiver ao menos um concorrente não marcado')
    expect(prompt).toContain('não analise nem grave nenhum canal')
    expect(prompt).toContain('aprovar a lista de concorrentes no app')
  })

  it('asks to skip the marked competitors and analyze the others, main first and with more weight', () => {
    expect(prompt).toContain('Pule os concorrentes marcados')
    expect(prompt).toContain('os principais ("main") primeiro e com mais peso')
  })

  it('asks to write each competitor name exactly as in the list', () => {
    expect(prompt).toContain('exatamente como está na lista')
  })

  it('asks to cover the nine channels with one helper agent for each, listing the channel keys', () => {
    expect(prompt).toContain('Cubra os nove canais')
    expect(prompt).toContain('um agente auxiliar para cada canal')
    CHANNELS.forEach(([key, label]) => {
      expect(prompt).toContain(`- ${key}: ${label}`)
    })
  })

  it('asks for public reading only: no account, no login, no paid service', () => {
    expect(prompt).toContain('só leitura pública')
    expect(prompt).toContain('não entre em nenhuma conta, não faça login e não use serviço pago')
  })

  it('asks for a score from 0 to 10 combining competitor activity and fit to the project, with rationale', () => {
    expect(prompt).toContain('nota de 0 a 10')
    expect(prompt).toContain('atividade dos concorrentes ali (os principais pesam mais, os secundários menos)')
    expect(prompt).toContain('aderência do canal ao projeto (plataforma e fase)')
    expect(prompt).toContain('rationale com a justificativa')
  })

  it('asks for the best performing content, as fact only with a public number', () => {
    expect(prompt).toContain('o tipo de conteúdo que performa melhor')
    expect(prompt).toContain('só quando houver número público (curtidas, comentários, visualizações ou posição no Google)')
  })

  it('asks to classify each finding in one of the five aspects, listing the keys', () => {
    expect(prompt).toContain('(format, topic, frequency, performance, cta)')
    expect(prompt).toContain('mesmo aspecto a achados de concorrentes diferentes que tratam da mesma coisa')
  })

  it('asks to register as fact only what has link, excerpt and tool, without inventing a source', () => {
    expect(prompt).toContain('só o que tem link (url), trecho (excerpt) e a ferramenta usada (tool)')
    expect(prompt).toContain('O que não tiver os três é "hypothesis"')
    expect(prompt).toContain('Não invente fonte')
  })

  it('asks to save one channel at a time, replacing the previous analysis when run again', () => {
    expect(prompt).toContain('Grave um canal de cada vez')
    expect(prompt).toContain('substitui a análise anterior, sem criar outra')
  })
})
