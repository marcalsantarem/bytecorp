import type { KeyValueStorage } from '../core/save/storage'

const DB_NAME = 'byte-corp-idle'
const STORE = 'kv'

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export class IndexedDbStorage implements KeyValueStorage {
  private dbPromise: Promise<IDBDatabase> | null = null

  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}

  private db(): Promise<IDBDatabase> {
    this.dbPromise ??= new Promise((resolve, reject) => {
      const open = this.factory.open(DB_NAME, 1)
      open.onupgradeneeded = () => open.result.createObjectStore(STORE)
      open.onsuccess = () => resolve(open.result)
      open.onerror = () => reject(open.error)
    })
    return this.dbPromise
  }

  private async store(mode: IDBTransactionMode): Promise<IDBObjectStore> {
    return (await this.db()).transaction(STORE, mode).objectStore(STORE)
  }

  async get(key: string): Promise<string | null> {
    const value = await request((await this.store('readonly')).get(key))
    return typeof value === 'string' ? value : null
  }

  async set(key: string, value: string): Promise<void> {
    await request((await this.store('readwrite')).put(value, key))
  }

  async delete(key: string): Promise<void> {
    await request((await this.store('readwrite')).delete(key))
  }
}
