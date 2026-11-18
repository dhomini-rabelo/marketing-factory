import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/api/client'
import { ProjectPhase, ProjectPlatform } from '@/api/models/project'
import { ProjectForm } from '@/pages/project/components/project-form/project-form'

function renderForm(props: Partial<Parameters<typeof ProjectForm>[0]> = {}) {
  const onSubmit = vi.fn(props.onSubmit ?? (async () => undefined))
  const user = userEvent.setup()
  render(<ProjectForm submitLabel="Criar projeto" {...props} onSubmit={onSubmit} />)
  return { user, onSubmit }
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nome'), 'Insumo')
  await user.click(screen.getByRole('radio', { name: 'Web + mobile' }))
  await user.click(screen.getByRole('radio', { name: 'Sem clientes' }))
  await user.type(screen.getByLabelText('Descrição curta'), 'Fábrica de marketing')
}

describe('ProjectForm', () => {
  it('shows platform and phase as radio cards with no choice made', () => {
    renderForm()

    const platform = screen.getByRole('radiogroup', { name: 'Plataforma' })
    const phase = screen.getByRole('radiogroup', { name: 'Fase' })

    expect(within(platform).getAllByRole('radio')).toHaveLength(3)
    expect(within(platform).getByRole('radio', { name: 'Web' })).not.toBeChecked()
    expect(within(platform).getByRole('radio', { name: 'Mobile' })).not.toBeChecked()
    expect(within(platform).getByRole('radio', { name: 'Web + mobile' })).not.toBeChecked()
    expect(within(phase).getAllByRole('radio')).toHaveLength(3)
    for (const radio of within(phase).getAllByRole('radio')) expect(radio).not.toBeChecked()
  })

  it('shows one message per field and does not save when the form is empty', async () => {
    const { user, onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Criar projeto' }))

    expect(await screen.findByText('Informe o nome do projeto')).toBeInTheDocument()
    expect(screen.getByText('Escolha a plataforma')).toBeInTheDocument()
    expect(screen.getByText('Escolha a fase')).toBeInTheDocument()
    expect(screen.getByText('Informe a descrição do projeto')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('sends the typed and chosen values', async () => {
    const { user, onSubmit } = renderForm()

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Criar projeto' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toEqual({
      name: 'Insumo',
      platform: ProjectPlatform.BOTH,
      phase: ProjectPhase.NO_CUSTOMERS,
      description: 'Fábrica de marketing',
    })
  })

  it('starts with the given values when editing', () => {
    renderForm({
      defaultValues: {
        name: 'Insumo',
        platform: ProjectPlatform.WEB,
        phase: ProjectPhase.CONSOLIDATED,
        description: 'Fábrica de marketing',
      },
    })

    expect(screen.getByLabelText('Nome')).toHaveValue('Insumo')
    expect(screen.getByRole('radio', { name: 'Web' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Produto consolidado' })).toBeChecked()
    expect(screen.getByLabelText('Descrição curta')).toHaveValue('Fábrica de marketing')
  })

  it('shows the message of the field the API refused and keeps what was typed', async () => {
    const refused = new ApiError({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'invalid project',
      fields: [{ field: 'name', code: 'TOO_LONG', message: 'name must have at most 80 characters' }],
    })
    const { user } = renderForm({ onSubmit: vi.fn().mockRejectedValue(refused) })

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Criar projeto' }))

    expect(await screen.findByText('Use no máximo 80 caracteres')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Insumo')
    expect(screen.getByRole('radio', { name: 'Web + mobile' })).toBeChecked()
    expect(screen.getByLabelText('Descrição curta')).toHaveValue('Fábrica de marketing')
  })

  it('disables the button while saving and saves once when clicked twice', async () => {
    let finishSaving: () => void = () => undefined
    const onSubmit = vi.fn(
      () => new Promise<void>((resolve) => { finishSaving = resolve }),
    )
    const { user } = renderForm({ onSubmit })

    await fillValidForm(user)
    await user.dblClick(screen.getByRole('button', { name: 'Criar projeto' }))

    const savingButton = await screen.findByRole('button', { name: 'Salvando...' })
    expect(savingButton).toBeDisabled()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    finishSaving()
    expect(await screen.findByRole('button', { name: 'Criar projeto' })).toBeEnabled()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('keeps the form and offers to try again when saving fails, then saves with the same values', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(new ApiError({ status: 500, code: 'INTERNAL_ERROR', message: 'boom' }))
      .mockResolvedValueOnce(undefined)
    const { user } = renderForm({ onSubmit })

    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Criar projeto' }))

    expect(await screen.findByText('Não foi possível salvar')).toBeInTheDocument()
    expect(screen.getByText('O que você preencheu continua aqui.')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Insumo')

    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(onSubmit).toHaveBeenCalledTimes(2)
    expect(onSubmit.mock.calls[1][0]).toEqual(onSubmit.mock.calls[0][0])
    expect(screen.queryByText('Não foi possível salvar')).not.toBeInTheDocument()
  })

  it('offers cancel only when a cancel handler is given, and calls it', async () => {
    const { user } = renderForm()
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()

    const onCancel = vi.fn()
    render(<ProjectForm submitLabel="Salvar" onSubmit={vi.fn()} onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
