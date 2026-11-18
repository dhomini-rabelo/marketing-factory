import type { NextFunction, Request, Response } from 'express'
import { SaveDocumentUseCase } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { DocumentPresenter } from '@infra/http/presenters/document-presenter'
import { documentRepository, projectRepository } from '@infra/http/repositories'
import {
  documentBodySchema,
  documentProjectParamsSchema,
} from '@infra/http/routes/document/document-schemas'

const saveDocumentUseCase = new SaveDocumentUseCase({
  project: projectRepository,
  document: documentRepository,
})

export async function saveDocument(request: Request, response: Response, next: NextFunction) {
  try {
    const result = await saveDocumentUseCase.execute({
      projectId: documentProjectParamsSchema.parse(request.params).id,
      ...documentBodySchema.parse(request.body ?? {}),
    })
    const status = result.wasCreated ? HttpStatus.CREATED : HttpStatus.OK

    return response.status(status).json(DocumentPresenter.toHttp(result.document))
  } catch (error) {
    next(error)
  }
}
