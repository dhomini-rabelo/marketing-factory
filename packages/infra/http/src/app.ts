import cors from 'cors'
import express from 'express'
import { readEnv } from '@infra/http/config/env'
import { errorHandler } from '@infra/http/middlewares/error-handler'
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

app.use(errorHandler)
