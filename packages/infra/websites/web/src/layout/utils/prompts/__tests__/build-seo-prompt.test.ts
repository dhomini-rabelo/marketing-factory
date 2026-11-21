import { describe, expect, it } from 'vitest'
import { buildSeoCompletePrompt, buildSeoPrompt } from '@/layout/utils/prompts/build-seo-prompt'

const PROJECT_ID = '3f1c2a9e-7b4d-4e0a-9d51-0c6a8e2b7f14'
const API_URL = 'http://127.0.0.1:7341'
const PROJECT_URL = `${API_URL}/projects/${PROJECT_ID}`
const ROUNDS_URL = `${PROJECT_URL}/seo/rounds`
const ROUND_ID = '9a7e5c31-2b6f-4d08-8c14-5e3a1f7d0b92'

const FORBIDDEN_NAMES = ['Cally', 'tl;dv', 'tldv', 'Fireflies', 'Otter', 'Fathom', 'MeetGeek', 'Tactiq']

describe('buildSeoPrompt', () => {
  const prompt = buildSeoPrompt({ projectId: PROJECT_ID, apiUrl: API_URL })

  it('asks to read the name, the description and the approved competitors from the API', () => {
    expect(prompt).toContain(`GET ${PROJECT_URL}`)
    expect(prompt).toContain('nome e a descrição do projeto')
    expect(prompt).toContain(`GET ${PROJECT_URL}/competitors`)
    expect(prompt).toContain('"approval"')
    expect(prompt).toContain('"incorrect": true')
  })

  it('asks for the search market Brasil, português', () => {
    expect(prompt).toContain('Mercado de busca: Brasil, português')
  })

  it('carries no project name, description or competitor name', () => {
    const lowerCasePrompt = prompt.toLowerCase()

    FORBIDDEN_NAMES.forEach((name) => {
      expect(lowerCasePrompt).not.toContain(name.toLowerCase())
    })
  })

  it('uses the values of the given project and API address', () => {
    const otherPrompt = buildSeoPrompt({ projectId: 'other-project', apiUrl: 'http://127.0.0.1:4444' })

    expect(otherPrompt).toContain('GET http://127.0.0.1:4444/projects/other-project')
    expect(otherPrompt).not.toContain(PROJECT_ID)
  })

  it('asks to open the round, save one competitor at a time and then the documents', () => {
    const roundStep = prompt.indexOf(`POST ${ROUNDS_URL}`)
    const competitorStep = prompt.indexOf(`PUT ${ROUNDS_URL}/{roundId}/competitors/{nome}`)
    const documentStep = prompt.indexOf(`POST ${ROUNDS_URL}/{roundId}/documents`)

    expect(roundStep).toBeGreaterThanOrEqual(0)
    expect(competitorStep).toBeGreaterThan(roundStep)
    expect(documentStep).toBeGreaterThan(competitorStep)
    expect(prompt).toContain('um de cada vez')
  })

  it('asks for the competitor name through encodeURIComponent and matched by the server', () => {
    expect(prompt).toContain('encodeURIComponent')
    expect(prompt).toContain('sem diferenciar maiúsculas')
  })

  it('asks to split what passes 1 MB', () => {
    expect(prompt).toContain('1 MB')
    expect(prompt).toContain('PAYLOAD_TOO_LARGE')
    expect(prompt).toContain('divida o documento em dois')
  })

  it('keeps the seo-v4 schema and writes no file as delivery', () => {
    expect(prompt).toContain('"schema": "seo-v4"')
    expect(prompt).not.toContain('SAIDA')
    expect(prompt).not.toContain('resposta.json')
  })
})

describe('buildSeoCompletePrompt', () => {
  const missing = ['Alfa', 'Beta & Co']
  const prompt = buildSeoCompletePrompt({
    projectId: PROJECT_ID,
    apiUrl: API_URL,
    roundId: ROUND_ID,
    missing,
  })

  it('points at the open round and does not ask to open another', () => {
    expect(prompt).toContain(`GET ${ROUNDS_URL}/${ROUND_ID}`)
    expect(prompt).toContain(`PUT ${ROUNDS_URL}/${ROUND_ID}/competitors/{nome}`)
    expect(prompt).not.toContain(`POST ${ROUNDS_URL} `)
    expect(prompt).toContain('Não abra uma rodada nova')
  })

  it('lists the missing competitors, one per line', () => {
    expect(prompt).toContain('- Alfa\n- Beta & Co')
  })

  it('does not resend the competitors already saved', () => {
    expect(prompt).toContain('não grave de novo quem já está na rodada')
    expect(prompt).toContain('SEO_COMPETITOR_ALREADY_SAVED')
  })

  it('carries no Cally or competitor name beyond the ones given as missing', () => {
    const lowerCasePrompt = prompt.toLowerCase()

    FORBIDDEN_NAMES.forEach((name) => {
      expect(lowerCasePrompt).not.toContain(name.toLowerCase())
    })
  })
})
