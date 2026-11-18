# Domain ownerships

Product map of the feature domains. Each entity has one owning module; a consumer stores the owner's identity and imports only the owner's public contract. `domain/base` is omitted (primitives only).

## projects

Owns:
- `Project`
- `Document`

Consumes: none.

## competitor-analysis

Owns:
- `ChannelAnalysis`
- `Competitor`
- the approval of the competitors list

Consumes from `projects`:
- identity: `projectId` on `ChannelAnalysis` and `Competitor`
- public contract: `ProjectRepository` port, `FieldsValidationError`, `FieldErrorCode`, `FieldIssue`
