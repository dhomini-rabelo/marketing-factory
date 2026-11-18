import cors from 'cors'
import express from 'express'
import { readEnv } from '@infra/http/config/env'
import { errorHandler } from '@infra/http/middlewares/error-handler'
import { getChannelAnalysis } from '@infra/http/routes/channel/get-channel-analysis'
import { listChannels } from '@infra/http/routes/channel/list-channels'
import { saveChannelAnalysis } from '@infra/http/routes/channel/save-channel-analysis'
import { listCompetitors } from '@infra/http/routes/competitor/list-competitors'
import { markCompetitor } from '@infra/http/routes/competitor/mark-competitor'
import { saveCompetitors } from '@infra/http/routes/competitor/save-competitors'
import { setCompetitorsApproval } from '@infra/http/routes/competitor/set-competitors-approval'
import { getDocument } from '@infra/http/routes/document/get-document'
import { listDocuments } from '@infra/http/routes/document/list-documents'
import { saveDocument } from '@infra/http/routes/document/save-document'
import { createProject } from '@infra/http/routes/project/create-project'
import { getProject } from '@infra/http/routes/project/get-project'
import { listProjects } from '@infra/http/routes/project/list-projects'
import { updateProject } from '@infra/http/routes/project/update-project'

export const app = express()

app.use(cors({ origin: [readEnv().webOrigin] }))
app.use(express.json({ limit: '1mb' }))

app.post('/projects', createProject)
app.get('/projects', listProjects)
app.get('/projects/:id', getProject)
app.put('/projects/:id', updateProject)
app.get('/projects/:id/documents', listDocuments)
app.get('/projects/:id/documents/:slug', getDocument)
app.put('/projects/:id/documents', saveDocument)

app.put('/projects/:id/channels/:channel', saveChannelAnalysis)
app.get('/projects/:id/channels', listChannels)
app.get('/projects/:id/channels/:channel', getChannelAnalysis)
app.put('/projects/:id/competitors', saveCompetitors)
app.get('/projects/:id/competitors', listCompetitors)
app.patch('/projects/:id/competitors/:competitorId', markCompetitor)
app.put('/projects/:id/competitors-approval', setCompetitorsApproval)

app.use(errorHandler)
