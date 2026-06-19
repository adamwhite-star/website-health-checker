import type { CheckResult } from './types'

const WEIGHTS: Record<string, { pass: number; warn: number; fail: number }> = {
  'https':            { pass: 10, warn: 5,  fail: 0 },
  'title':            { pass: 10, warn: 5,  fail: 0 },
  'meta-description': { pass: 10, warn: 5,  fail: 0 },
  'h1':               { pass: 10, warn: 5,  fail: 0 },
  'viewport':         { pass: 10, warn: 5,  fail: 0 },
  'canonical':        { pass: 10, warn: 5,  fail: 0 },
  'schema':           { pass: 10, warn: 5,  fail: 0 },
}

export function calculateScore(checks: CheckResult[]): number {
  const total = Object.values(WEIGHTS).reduce((sum, w) => sum + w.pass, 0)
  const earned = checks.reduce((sum, c) => {
    const w = WEIGHTS[c.id]
    if (!w) return sum
    return sum + w[c.status]
  }, 0)
  return Math.round((earned / total) * 100)
}
