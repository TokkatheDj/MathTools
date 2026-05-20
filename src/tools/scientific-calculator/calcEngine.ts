import * as math from 'mathjs'

export function evaluate(expression: string, angleMode: 'DEG' | 'RAD'): string {
  try {
    let expr = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/\^/g, '^')

    if (angleMode === 'DEG') {
      expr = expr
        .replace(/sin\(/g, 'sin(pi/180*')
        .replace(/cos\(/g, 'cos(pi/180*')
        .replace(/tan\(/g, 'tan(pi/180*')
    }

    const result = math.evaluate(expr)
    if (typeof result === 'number') {
      if (!isFinite(result)) return 'Error'
      return math.format(result, { notation: 'auto', precision: 10 })
    }
    return String(result)
  } catch {
    return 'Error'
  }
}
