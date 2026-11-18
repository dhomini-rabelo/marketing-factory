import { describe, expect, it } from 'vitest'
import { buildCollectionPrompt } from '@/layout/utils/prompts/build-collection-prompt'

const PROJECT_ID = '3f1c2a9e-7b4d-4e0a-9d51-0c6a8e2b7f14'
const API_URL = 'http://127.0.0.1:7341'

describe('buildCollectionPrompt', () => {
  const prompt = buildCollectionPrompt({ projectId: PROJECT_ID, apiUrl: API_URL })

  it('carries the project code and the API address of the documents route', () => {
    expect(prompt).toContain(`Projeto no app: ${PROJECT_ID}`)
    expect(prompt).toContain(`PUT ${API_URL}/projects/${PROJECT_ID}/documents`)
    expect(prompt).toContain(`GET ${API_URL}/projects/${PROJECT_ID}/documents`)
  })

  it('uses the values of the given project and API address', () => {
    const otherPrompt = buildCollectionPrompt({
      projectId: 'other-project',
      apiUrl: 'http://127.0.0.1:4444',
    })

    expect(otherPrompt).toContain('PUT http://127.0.0.1:4444/projects/other-project/documents')
    expect(otherPrompt).not.toContain(PROJECT_ID)
  })

  it('asks the agent to read the open repository without changing it', () => {
    expect(prompt).toContain('aberto na pasta do repositório de um produto')
    expect(prompt).toContain('Não crie, não edite e não apague arquivos dentro dele')
  })

  it('keeps the overview, the features and the channels, links and assets', () => {
    expect(prompt).toContain('1. Visão geral do produto')
    expect(prompt).toContain('2. Features principais e features secundárias, em dois documentos')
    expect(prompt).toContain('4. Canais, links e ativos')
  })

  it('does not ask the repository for audience, value proposition, competitors or tone of voice', () => {
    expect(prompt).toContain(
      'Não procure nem grave público-alvo, dores, proposta de valor, diferenciais, concorrentes, tom de voz',
    )
    expect(prompt).toContain('coletado em outra etapa')
    expect(prompt).not.toContain('Cubra estas 10 categorias')
  })

  it('marks the prices found in the repository as to be confirmed', () => {
    expect(prompt).toContain('3. Preços e planos')
    expect(prompt).toContain('marque cada valor com "(a confirmar)"')
    expect(prompt).toContain('"Não encontrado no repositório."')
  })

  it('limits SEO to the keywords already registered in the repository', () => {
    expect(prompt).toContain('5. Palavras-chave de SEO: só as que já estão cadastradas no repositório')
    expect(prompt).toContain('Não tire palavras do vocabulário do produto')
  })

  it('lets the agent choose subject documents, such as member versus admin, instead of a fixed list', () => {
    expect(prompt).toContain('6. Documentos que você escolhe')
    expect(prompt).toContain('o que um membro e um admin podem fazer')
    expect(prompt).toContain('São exemplos, não uma lista a cumprir')
    expect(prompt).not.toContain('Restrições')
  })

  it('keeps file paths, sources and the repository link out of the documents', () => {
    expect(prompt).toContain('Nada de caminho de arquivo')
    expect(prompt).toContain('não ponha seção de fontes, lista de onde você procurou nem o link do repositório')
  })

  it('asks to save each document by a plain title, so running again updates instead of copying', () => {
    expect(prompt).toContain('{"title": "...", "description": "...", "body": "..."}')
    expect(prompt).toContain('sem número na frente')
    expect(prompt).toContain('mesmo título atualiza o documento que já existe, sem criar cópia')
  })

  it('asks for a short final answer without repository link, paths or search notes', () => {
    expect(prompt).toContain('responda em até 8 linhas')
    expect(prompt).toContain('Sem link do repositório, caminho de arquivo, comando, resposta da API')
  })

  it('forbids inventing and allows the product to be at an early stage', () => {
    expect(prompt).toContain('Não invente')
    expect(prompt).toContain('fase inicial')
  })
})
