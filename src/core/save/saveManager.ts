import type { GameEngine } from '../engine'
import { decodeSave, encodeSave, type DecodeResult } from './codec'
import { SAVE_KEY, type KeyValueStorage } from './storage'

export type LoadResult = { kind: 'empty' } | DecodeResult

export const AUTOSAVE_INTERVAL_MS = 10_000

export class SaveManager {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly now: () => number = Date.now,
  ) {}

  async load(): Promise<LoadResult> {
    const text = await this.storage.get(SAVE_KEY)
    if (text === null) return { kind: 'empty' }
    return decodeSave(text)
  }

  async save(engine: GameEngine): Promise<void> {
    await this.storage.set(SAVE_KEY, encodeSave(engine.state, this.now()))
  }

  async clear(): Promise<void> {
    await this.storage.delete(SAVE_KEY)
  }
}
