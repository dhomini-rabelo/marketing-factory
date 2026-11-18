import type { NextFunction, Request, Response } from 'express'
import { ListDocumentsUseCase } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { DocumentPresenter } from '@infra/http/presenters/document-presenter'
import { documentRepository, projectRepository } from '@infra/http/repositories'
import { documentProjectParamsSchema } from '@infra/http/routes/document/document-schemas'

const listDocumentsUseCase = new ListDocumentsUseCase({
  project: projectRepository,
  document: documentRepository,
})

export async function listDocuments(request: Request, response: Response, next: NextFunction) {
  try {
    const summaries = await listDocumentsUseCase.execute({
      projectId: documentProjectParamsSchema.parse(request.params).id,
    })

    return response
      .status(HttpStatus.OK)
      .json({ documents: summaries.map((summary) => DocumentPresenter.toListItemHttp(summary)) })
  } catch (error) {
    next(error)
  }
}
