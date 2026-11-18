import type { NextFunction, Request, Response } from 'express'
import { GetDocumentUseCase } from '@domain/projects'
import { HttpStatus } from '@modules/utils'
import { DocumentPresenter } from '@infra/http/presenters/document-presenter'
import { documentRepository, projectRepository } from '@infra/http/repositories'
import { documentParamsSchema } from '@infra/http/routes/document/document-schemas'

const getDocumentUseCase = new GetDocumentUseCase({
  project: projectRepository,
  document: documentRepository,
})

export async function getDocument(request: Request, response: Response, next: NextFunction) {
  try {
    const params = documentParamsSchema.parse(request.params)
    const document = await getDocumentUseCase.execute({
      projectId: params.id,
      slug: params.slug,
    })

    return response.status(HttpStatus.OK).json(DocumentPresenter.toHttp(document))
  } catch (error) {
    next(error)
  }
}
