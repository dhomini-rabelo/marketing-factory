import { createRequire } from 'node:module'
import { Worker } from 'node:worker_threads'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ID, createID } from '@domain/base'
import {
  CHANNEL_ORDER,
  Channel,
  ChannelAnalysis,
  Finding,
  FindingAspect,
  FindingKind,
} from '@domain/competitor-analysis'
import { Document, Project, ProjectPhase, ProjectPlatform } from '@domain/projects'
import { createTempDatabase, TempDatabase } from '@infra/db/__tests__/temp-database'
import { SqliteChannelAnalysisRepository } from '@infra/db/repos/channel-analysis/repo'
import { SqliteDocumentRepository } from '@infra/db/repos/document/repo'
import { SqliteProjectRepository } from '@infra/db/repos/project/repo'

function buildFinding(statement: string, aspect = FindingAspect.FORMAT): Finding {
  return {
    competitor: 'Acme',
    aspect,
    kind: FindingKind.FACT,
    statement,
    url: 'https://acme.test/post',
    excerpt: null,
    tool: 'browser',
  }
}

function buildAnalysis(input: {
  projectId: ID
  channel: Channel
  score?: number
  findings?: Finding[]
}): ChannelAnalysis {
  return ChannelAnalysis.create({
    projectId: input.projectId,
    channel: input.channel,
    score: input.score ?? 7,
    rationale: 'Strong presence',
    bestContent: { type: 'video', evidence: 'Most viewed', basis: FindingKind.FACT },
    findings: input.findings ?? [buildFinding('First'), buildFinding('Second')],
    collectedAt: new Date('2026-11-18T10:00:00.000Z'),
  })
}

function holdWriteLock(input: { filePath: string; holdMs: number }): Promise<Worker> {
  const sqlitePath = createRequire(import.meta.url).resolve('better-sqlite3')
  const worker = new Worker(
    `
    const { workerData, parentPort } = require('node:worker_threads')
    const Database = require(workerData.sqlitePath)
    const database = new Database(workerData.filePath)
    database.pragma('journal_mode = WAL')
    database.exec('BEGIN IMMEDIATE')
    parentPort.postMessage('locked')
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, workerData.holdMs)
    database.exec('COMMIT')
    database.close()
    `,
    { eval: true, workerData: { sqlitePath, filePath: input.filePath, holdMs: input.holdMs } },
  )

  return new Promise((resolve, reject) => {
    worker.once('message', () => resolve(worker))
    worker.once('error', reject)
  })
}

function waitForExit(worker: Worker): Promise<void> {
  return new Promise((resolve) => worker.once('exit', () => resolve()))
}

describe('SqliteChannelAnalysisRepository', () => {
  let temp: TempDatabase
  let repository: SqliteChannelAnalysisRepository
  let projectId: ID

  beforeEach(async () => {
    temp = createTempDatabase()
    repository = new SqliteChannelAnalysisRepository(temp.database)
    const project = Project.create({
      name: 'Acme',
      platform: ProjectPlatform.WEB,
      phase: ProjectPhase.NO_CUSTOMERS,
      description: 'Acme project',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await new SqliteProjectRepository(temp.database).create(project)
    projectId = project.id
  })

  afterEach(() => {
    temp.dispose()
  })

  it('saves an analysis with its findings in write order', async () => {
    const analysis = buildAnalysis({
      projectId,
      channel: Channel.SITE_PRICING,
      findings: [buildFinding('Third', FindingAspect.CTA), buildFinding('First')],
    })

    const result = await repository.replaceForChannel(analysis)
    const found = await repository.findByChannel({ projectId, channel: Channel.SITE_PRICING })

    expect(result.wasCreated).toBe(true)
    expect(found?.id.isEqual(analysis.id)).toBe(true)
    expect(found?.props).toEqual(analysis.props)
    expect(found?.props.findings.map((finding) => finding.statement)).toEqual(['Third', 'First'])
  })

  it('returns null for a channel that was never collected', async () => {
    const found = await repository.findByChannel({ projectId, channel: Channel.ADS })

    expect(found).toBeNull()
  })

  it('replaces the analysis and every finding when the same channel is saved again', async () => {
    const first = await repository.replaceForChannel(buildAnalysis({ projectId, channel: Channel.SITE_PRICING }))
    const second = await repository.replaceForChannel(
      buildAnalysis({ projectId, channel: Channel.SITE_PRICING, score: 3, findings: [buildFinding('Only')] }),
    )
    const collected = await repository.listCollected(projectId)
    const findingsCount = temp.database.prepare('SELECT COUNT(*) AS total FROM channel_findings').get()

    expect(first.wasCreated).toBe(true)
    expect(second.wasCreated).toBe(false)
    expect(second.analysis.id.isEqual(first.analysis.id)).toBe(true)
    expect(collected).toHaveLength(1)
    expect(collected[0].props.score).toBe(3)
    expect(collected[0].props.findings.map((finding) => finding.statement)).toEqual(['Only'])
    expect(findingsCount).toEqual({ total: 1 })
  })

  it('keeps the previous analysis whole when the replacement fails midway', async () => {
    const previous = buildAnalysis({ projectId, channel: Channel.SITE_PRICING })
    await repository.replaceForChannel(previous)
    const broken = buildAnalysis({
      projectId,
      channel: Channel.SITE_PRICING,
      score: 1,
      findings: [buildFinding('Valid'), { ...buildFinding('Broken'), statement: null as unknown as string }],
    })

    await expect(repository.replaceForChannel(broken)).rejects.toThrow()
    const found = await repository.findByChannel({ projectId, channel: Channel.SITE_PRICING })

    expect(found?.props).toEqual(previous.props)
  })

  it('lists the collected channels in the channel order of the domain', async () => {
    await repository.replaceForChannel(buildAnalysis({ projectId, channel: Channel.ADS }))
    await repository.replaceForChannel(buildAnalysis({ projectId, channel: Channel.SITE_PRICING }))
    await repository.replaceForChannel(buildAnalysis({ projectId, channel: Channel.LINKEDIN }))

    const collected = await repository.listCollected(projectId)

    expect(collected.map((analysis) => analysis.props.channel)).toEqual([
      Channel.SITE_PRICING,
      Channel.LINKEDIN,
      Channel.ADS,
    ])
  })

  it('does not list the row of the retired seo channel and keeps it in the table', async () => {
    temp.database
      .prepare(
        `INSERT INTO channel_analyses
           (id, project_id, channel, score, rationale, best_content_type,
            best_content_evidence, best_content_basis, collected_at)
         VALUES (?, ?, 'seo', 8, 'Old SEO note', 'guide', 'Most read', 'fact', '2026-11-01T10:00:00.000Z')`,
      )
      .run(createID().toValue(), projectId.toValue())
    await repository.replaceForChannel(buildAnalysis({ projectId, channel: Channel.LINKEDIN }))

    const collected = await repository.listCollected(projectId)
    const seoRows = temp.database.prepare("SELECT COUNT(*) AS total FROM channel_analyses WHERE channel = 'seo'").get()

    expect(collected.map((analysis) => analysis.props.channel)).toEqual([Channel.LINKEDIN])
    expect(seoRows).toEqual({ total: 1 })
  })

  it('accepts eight simultaneous writes of different channels from separate connections', async () => {
    const channels = [...CHANNEL_ORDER]
    const repositories = channels.map(() => new SqliteChannelAnalysisRepository(temp.reopen()))

    await Promise.all(
      channels.map((channel, index) =>
        repositories[index].replaceForChannel(buildAnalysis({ projectId, channel })),
      ),
    )
    const collected = await repository.listCollected(projectId)

    expect(channels).toHaveLength(CHANNEL_ORDER.length)
    expect(collected.map((analysis) => analysis.props.channel)).toEqual(channels)
    collected.forEach((analysis) => expect(analysis.props.findings).toHaveLength(2))
  })

  it('preserves accents and emoji when saving and reading an analysis', async () => {
    const analysis = ChannelAnalysis.create({
      projectId,
      channel: Channel.INSTAGRAM,
      score: 8,
      rationale: 'Presença forte, com ação constante 🚀',
      bestContent: { type: 'Vídeo curto', evidence: 'Maior alcance 🎯', basis: FindingKind.FACT },
      findings: [buildFinding('Publicação diária com emoção 🔥 e conversão')],
      collectedAt: new Date('2026-11-18T10:00:00.000Z'),
    })

    await repository.replaceForChannel(analysis)
    const found = await repository.findByChannel({ projectId, channel: Channel.INSTAGRAM })

    expect(found?.props.rationale).toBe('Presença forte, com ação constante 🚀')
    expect(found?.props.bestContent.evidence).toBe('Maior alcance 🎯')
    expect(found?.props.findings[0].statement).toBe('Publicação diária com emoção 🔥 e conversão')
    expect(found?.props).toEqual(analysis.props)
  })

  it('leaves the projects and documents tables unchanged after saving channels', async () => {
    const now = new Date('2026-11-18T10:00:00.000Z')
    await new SqliteDocumentRepository(temp.database).saveByTitle(
      Document.create({
        projectId,
        slug: 'positioning',
        title: 'Positioning',
        description: 'About positioning',
        body: 'Body',
        createdAt: now,
        updatedAt: now,
      }),
    )
    const readAppTables = () => ({
      projects: temp.database.prepare('SELECT * FROM projects ORDER BY id').all(),
      documents: temp.database.prepare('SELECT * FROM documents ORDER BY id').all(),
    })
    const before = readAppTables()

    for (const channel of CHANNEL_ORDER) {
      await repository.replaceForChannel(buildAnalysis({ projectId, channel }))
    }
    await repository.replaceForChannel(buildAnalysis({ projectId, channel: Channel.SITE_PRICING, score: 2 }))

    expect(before.projects).toHaveLength(1)
    expect(before.documents).toHaveLength(1)
    expect(readAppTables()).toEqual(before)
  })

  it('keeps the last write whole when the same channel is written from separate connections', async () => {
    const scores = [1, 2, 3, 4, 5]
    const repositories = scores.map(() => new SqliteChannelAnalysisRepository(temp.reopen()))

    await Promise.all(
      scores.map((score, index) =>
        repositories[index].replaceForChannel(
          buildAnalysis({
            projectId,
            channel: Channel.SITE_PRICING,
            score,
            findings: [buildFinding(`Score ${score}`), buildFinding(`Score ${score} again`)],
          }),
        ),
      ),
    )
    const collected = await repository.listCollected(projectId)
    const [analysis] = collected
    const score = analysis.props.score

    expect(collected).toHaveLength(1)
    expect(analysis.props.findings.map((finding) => finding.statement)).toEqual([
      `Score ${score}`,
      `Score ${score} again`,
    ])
  })

  it('waits for a write lock held by another connection instead of failing as busy', async () => {
    const worker = await holdWriteLock({ filePath: temp.filePath, holdMs: 300 })
    const exited = waitForExit(worker)
    const concurrent = new SqliteChannelAnalysisRepository(temp.reopen())

    const startedAt = Date.now()
    const result = await concurrent.replaceForChannel(buildAnalysis({ projectId, channel: Channel.SITE_PRICING }))
    await exited

    expect(result.wasCreated).toBe(true)
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(200)
    expect(await repository.findByChannel({ projectId, channel: Channel.SITE_PRICING })).not.toBeNull()
  })
})
