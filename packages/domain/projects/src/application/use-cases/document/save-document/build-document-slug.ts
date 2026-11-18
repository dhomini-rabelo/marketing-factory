const COMBINING_MARKS = /\p{M}/gu
const NON_ALPHANUMERIC_RUNS = /[^\p{L}\p{N}]+/gu
const EDGE_HYPHENS = /^-+|-+$/g

export function buildDocumentSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(NON_ALPHANUMERIC_RUNS, '-')
    .replace(EDGE_HYPHENS, '')
}
