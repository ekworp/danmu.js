export function validAreaLineRule(line: unknown): line is number {
  return typeof line === 'number' && line >= 0 && Number.isInteger(line)
}
