const HIGH_SCORE = 6
const MEDIUM_SCORE = 4

export function getScoreRingColor(score: number) {
  if (score >= HIGH_SCORE) return '#ffffff'
  return score >= MEDIUM_SCORE ? '#ffc58a' : '#ff9b73'
}
