import { expect, it } from 'vitest'

it('testes .ts rodam em node, sem DOM', () => {
  expect(typeof document).toBe('undefined')
})
