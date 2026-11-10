// Contrato de armazenamento chave/valor. A implementação em IndexedDB fica em
// src/platform; a sincronização em nuvem futura (GDD 21.1) entra como outro adaptador.
export interface KeyValueStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  delete(key: string): Promise<void>
}

// GDD 21.5: um único slot por navegador ou dispositivo.
export const SAVE_KEY = 'save'
export const SETTINGS_KEY = 'settings'

export class MemoryStorage implements KeyValueStorage {
  private data = new Map<string, string>()

  async get(key: string) {
    return this.data.get(key) ?? null
  }

  async set(key: string, value: string) {
    this.data.set(key, value)
  }

  async delete(key: string) {
    this.data.delete(key)
  }
}
