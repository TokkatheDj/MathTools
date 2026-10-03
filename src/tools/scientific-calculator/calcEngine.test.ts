import { describe, expect, it } from 'vitest'
import { evaluate } from './calcEngine'

// Every key on the keypad, plus the answers the old engine got wrong (Oct 2026).
describe('scientific calculator', () => {
  it.each([
    ['log(100)', 'DEG', '2'],          // was 4.605 - natural log behind the "log" key
    ['log(1000)', 'DEG', '3'],
    ['ln(e)', 'DEG', '1'],             // was Error - mathjs has no ln
    ['√(16)', 'DEG', '4'],             // was Error - mathjs has no √
    ['√(2)', 'DEG', '1.414213562'],
    ['sin(30+60)', 'DEG', '1'],        // was -0.74 - only the first number became radians
    ['sin(30)', 'DEG', '0.5'],
    ['cos(2*30)', 'DEG', '0.5'],
    ['cos(90)', 'DEG', '0'],           // was 6.12e-17
    ['sin(180)', 'DEG', '0'],
    ['tan(45)', 'DEG', '1'],
    ['tan(90)', 'DEG', 'Error'],       // was 1.63e+16 - undefined, not huge
    ['sin(π/2)', 'RAD', '1'],
    ['cos(π)', 'RAD', '-1'],
    ['sin(90)', 'RAD', '0.8939966636'],// radians mode leaves numbers as radians
    ['5!', 'DEG', '120'],
    ['2^10', 'DEG', '1024'],
    ['3×4÷2', 'DEG', '6'],
    ['50%', 'DEG', '0.5'],
    ['200*10%', 'DEG', '20'],
    ['0.1+0.2', 'DEG', '0.3'],
    ['log(0)', 'DEG', 'Error'],
    ['1/0', 'DEG', 'Error'],
    ['2+', 'DEG', 'Error'],
  ] as const)('%s (%s) = %s', (expr, mode, want) => {
    expect(evaluate(expr, mode)).toBe(want)
  })
})
