import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import { IndexedDbStorage } from './indexedDbStorage'

describe('IndexedDbStorage', () => {
  it('grava, lê e apaga valores', async () => {
    const factory = new IDBFactory()
    const storage = new IndexedDbStorage(factory)
    expect(await storage.get('save')).toBeNull()
    await storage.set('save', '{"a":1}')
    expect(await storage.get('save')).toBe('{"a":1}')

    // Outra instância sobre o mesmo banco enxerga o dado persistido.
    expect(await new IndexedDbStorage(factory).get('save')).toBe('{"a":1}')

    await storage.delete('save')
    expect(await storage.get('save')).toBeNull()
  })
})
