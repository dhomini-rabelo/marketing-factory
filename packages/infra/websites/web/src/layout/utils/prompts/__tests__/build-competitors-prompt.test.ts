import { describe, expect, it } from 'vitest'
import { buildCompetitorsPrompt } from '@/layout/utils/prompts/build-competitors-prompt'

const PROJECT_ID = '3f1c2a9e-7b4d-4e0a-9d51-0c6a8e2b7f14'
const API_URL = 'http://127.0.0.1:7341'

describe('buildCompetitorsPrompt', () => {
  const prompt = buildCompetitorsPrompt({ projectId: PROJECT_ID, apiUrl: API_URL })
  const lines = prompt.split('\n')

  it('carries the project code and the API address', () => {
    expect(prompt).toContain(PROJECT_ID)
    expect(prompt).toContain(`GET ${API_URL}/projects/${PROJECT_ID}`)
    expect(prompt).toContain(`PUT ${API_URL}/projects/${PROJECT_ID}/competitors`)
  })

  it('uses the values of the given project and API address', () => {
    const otherPrompt = buildCompetitorsPrompt({
      projectId: 'other-project',
      apiUrl: 'http://127.0.0.1:4444',
    })

    expect(otherPrompt).toContain('PUT http://127.0.0.1:4444/projects/other-project/competitors')
    expect(otherPrompt).not.toContain(PROJECT_ID)
    expect(otherPrompt).not.toContain(API_URL)
  })

  it('asks to read the basic data and the documents, starting from the competitors document', () => {
    expect(prompt).toContain(`GET ${API_URL}/projects/${PROJECT_ID}.`)
    expect(prompt).toContain(`GET ${API_URL}/projects/${PROJECT_ID}/documents.`)
    expect(prompt).toContain('Se existir um documento de concorrentes')
    expect(prompt).toContain('use-o como ponto de partida')
  })

  it('asks to discover the competitors by searching the web', () => {
    expect(prompt).toContain('Descubra os concorrentes pela busca na web')
  })

  it('asks to qualify each competitor before any channel', () => {
    expect(prompt).toContain('Qualifique cada concorrente antes de qualquer canal')
    expect(prompt).toContain('foco de mercado, serviços, features e público')
  })

  it('asks for the main or secondary role compared to the project, with rationale', () => {
    expect(prompt).toContain('"main" (principal: atua no mesmo mercado e oferece serviço ou feature equivalente ao do projeto)')
    expect(prompt).toContain('"secondary" (secundário)')
    expect(prompt).toContain('com a justificativa em rationale')
    expect(prompt).toContain('Papéis aceitos: main, secondary')
  })

  it('puts the number of competitors in its own line, minimum 3, target 6, maximum 8', () => {
    expect(lines).toContain('Número de concorrentes: mínimo 3, alvo 6, máximo 8')
    expect(prompt).toContain('Alvo: 4 principais e 2 secundários. Máximo: 5 principais e 3 secundários.')
  })

  it('asks to read the saved list and the founder marks, without proposing the marked again', () => {
    expect(prompt).toContain(`GET ${API_URL}/projects/${PROJECT_ID}/competitors.`)
    expect(prompt).toContain('"incorrect": true')
    expect(prompt).toContain('Não proponha de novo quem está marcado')
  })

  it('asks to save the list through the API with the body fields', () => {
    expect(prompt).toContain(
      '{"competitors": [{"name": "...", "role": "main", "marketFocus": "...", "services": "...", "features": "...", "audience": "...", "rationale": "...", "url": "..."}]}',
    )
    expect(prompt).toContain('troca a lista anterior')
  })

  it('asks to tell the founder in the terminal when the list is below the minimum', () => {
    expect(prompt).toContain('menos de 3 concorrentes')
    expect(prompt).toContain('a lista ficou abaixo do mínimo')
  })

  it('asks for public reading only: no account, no login, no paid service', () => {
    expect(prompt).toContain('só leitura pública')
    expect(prompt).toContain('não entre em nenhuma conta, não faça login e não use serviço pago')
  })

  it('ends by asking the founder to check the list in the app, mark the wrong ones and approve, with no channel analysis', () => {
    const lastLine = lines[lines.length - 1]

    expect(lastLine).toContain('conferir a lista no app')
    expect(lastLine).toContain('marcar o que está errado')
    expect(lastLine).toContain('aprovar a lista')
    expect(lastLine).toContain('Não analise nenhum canal')
  })
})
