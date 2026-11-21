const LIMIT_REASON_PATTERNS = {
  audience: /público|audience|classificad|20 exemplos/i,
  subtopics: /subtopics|subassunto/i,
  date: /datePublished|data real|sem data|datas/i,
  author: /autor/i,
  paragraphs: /parágrafo|article|main/i,
  faq: /FAQ|JSON-LD/i,
  images: /imagem|imagens|article|main/i,
  old: /antigo|180 dias/i,
  modifiedAt: /dateModified|modifiedAt/i,
  summary: /resumo|card/i,
  tone: /\btom\b/i,
}

export type LimitReasonKey = keyof typeof LIMIT_REASON_PATTERNS

export function findLimitReason(limits: string, key: LimitReasonKey): string | null {
  const sentences = limits ? limits.split(/(?<=\.)\s+/) : []
  return sentences.find((sentence) => LIMIT_REASON_PATTERNS[key].test(sentence)) ?? null
}

export function describeMissingReason(limits: string, key: LimitReasonKey): string {
  return findLimitReason(limits, key) ?? 'o campo veio vazio e os limites da coleta não explicam o motivo'
}
