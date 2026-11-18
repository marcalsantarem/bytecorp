import { describe, expect, it, vi } from 'vitest'
import { D } from '../core/decimal'
import { DEFAULT_CONFIG, GameEngine } from '../core/engine'
import { MemoryStorage, SETTINGS_KEY } from '../core/save/storage'
import { SaveManager } from '../core/save/saveManager'
import { createInitialState } from '../core/state'
import { createPersistence } from './purchaseSave'
import { resetGame } from './resetGame'
import {
  applySettingsPatch,
  defaultSettings,
  loadSettings,
  parseSettings,
  serializeSettings,
  SETTINGS_VERSION,
} from './settings'

describe('padrões', () => {
  it('têm todos os campos e velocidade 1x', () => {
    const s = defaultSettings()
    expect(s.volumes).toEqual({ music: 70, sfx: 80, ui: 80 })
    expect(s.graphicsQuality).toBe('auto')
    expect(s.locale).toBe('pt-BR')
    expect(s.notifications).toEqual({ enabled: false, categories: { achievement: true, acceleratorExpired: true, offlineFull: true } })
    expect(s.gameSpeed).toBe(1)
  })

  it('idioma vem do navegador', () => {
    expect(defaultSettings(['en-US', 'pt-BR']).locale).toBe('en')
    expect(defaultSettings(['pt-PT']).locale).toBe('pt-BR')
    expect(defaultSettings(['fr-FR']).locale).toBe('pt-BR')
  })
})

describe('parseSettings', () => {
  it('ausente, corrompido ou não objeto vira padrão', () => {
    for (const raw of [null, '', '{', '[]', '42', 'null']) expect(parseSettings(raw, ['en'])).toEqual(defaultSettings(['en']))
  })

  it('ida e volta preserva os valores', () => {
    const s = applySettingsPatch(defaultSettings(), {
      volumes: { music: 0, ui: 100 },
      graphicsQuality: 'low',
      locale: 'en',
      notifications: { enabled: true, categories: { offlineFull: false } },
    })
    const raw = serializeSettings(s)
    expect(JSON.parse(raw).version).toBe(SETTINGS_VERSION)
    expect(parseSettings(raw, ['pt-BR'])).toEqual(s)
  })

  it('valida campo a campo sem descartar os válidos', () => {
    const raw = JSON.stringify({
      version: SETTINGS_VERSION,
      volumes: { music: 150, sfx: -3, ui: 'alto' },
      graphicsQuality: 'ultra',
      locale: 'fr',
      notifications: { enabled: 'sim', categories: { achievement: false, offlineFull: 1 } },
      gameSpeed: 4,
    })
    const s = parseSettings(raw, ['en'])
    expect(s.volumes).toEqual({ music: 100, sfx: 0, ui: 80 })
    expect(s.graphicsQuality).toBe('auto')
    expect(s.locale).toBe('en')
    expect(s.notifications).toEqual({ enabled: false, categories: { achievement: false, acceleratorExpired: true, offlineFull: true } })
    expect(s.gameSpeed).toBe(1)
  })

  it('arredonda volumes fracionários', () => {
    const raw = JSON.stringify({ version: SETTINGS_VERSION, volumes: { music: 42.6 } })
    expect(parseSettings(raw).volumes.music).toBe(43)
  })

  it('versão futura desconhecida vira padrão', () => {
    expect(parseSettings(JSON.stringify({ version: 99, locale: 'en' }), ['pt-BR'])).toEqual(defaultSettings(['pt-BR']))
  })
})

describe('migração da versão 0 (só idioma)', () => {
  it('mantém o idioma salvo acima do navegador', () => {
    const s = parseSettings('{"locale":"en"}', ['pt-BR'])
    expect(s).toEqual({ ...defaultSettings(), locale: 'en' })
  })

  it('aceita a chave language', () => {
    expect(parseSettings('{"language":"en"}').locale).toBe('en')
  })

  it('sem idioma válido usa o do navegador', () => {
    expect(parseSettings('{}', ['en-GB']).locale).toBe('en')
    expect(parseSettings('{"locale":"xx"}', ['en-GB']).locale).toBe('en')
  })
})

describe('SettingsStore', () => {
  it('carrega, altera, avisa e grava', async () => {
    const storage = new MemoryStorage()
    await storage.set(SETTINGS_KEY, '{"locale":"en"}')
    const store = await loadSettings(storage, ['pt-BR'])
    expect(store.current.locale).toBe('en')

    const listener = vi.fn()
    const off = store.subscribe(listener)
    await store.update({ locale: 'pt-BR', volumes: { sfx: 10 } })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0]?.[0]).toMatchObject({ locale: 'pt-BR', volumes: { sfx: 10 } })
    expect(parseSettings(await storage.get(SETTINGS_KEY), ['en'])).toEqual(store.current)

    off()
    await store.update({ locale: 'en' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('alteração sem efeito não avisa nem grava', async () => {
    const storage = new MemoryStorage()
    const store = await loadSettings(storage, [])
    const listener = vi.fn()
    store.subscribe(listener)
    await store.update({ locale: 'pt-BR', volumes: { music: 70 } })
    expect(listener).not.toHaveBeenCalled()
    expect(await storage.get(SETTINGS_KEY)).toBeNull()
  })

  it('valor inválido vindo da UI é corrigido', async () => {
    const store = await loadSettings(new MemoryStorage(), [])
    await store.update({ volumes: { music: 300 } })
    expect(store.current.volumes.music).toBe(100)
  })

  it('gravações seguidas terminam com o último valor', async () => {
    const storage = new MemoryStorage()
    const store = await loadSettings(storage, [])
    void store.update({ volumes: { music: 1 } })
    void store.update({ volumes: { music: 2 } })
    await store.update({ volumes: { music: 3 } })
    expect(parseSettings(await storage.get(SETTINGS_KEY)).volumes.music).toBe(3)
  })

  it('falha de leitura ou gravação não derruba', async () => {
    const storage = new MemoryStorage()
    vi.spyOn(storage, 'get').mockRejectedValue(new Error('x'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const store = await loadSettings(storage, ['en'])
    expect(store.current).toEqual(defaultSettings(['en']))
    vi.spyOn(storage, 'set').mockRejectedValue(new Error('y'))
    await expect(store.update({ locale: 'pt-BR' })).resolves.toBeUndefined()
    expect(store.current.locale).toBe('pt-BR')
    errorSpy.mockRestore()
  })

  it('sobrevive a Novo jogo', async () => {
    const storage = new MemoryStorage()
    const store = await loadSettings(storage, [])
    await store.update({ locale: 'en', graphicsQuality: 'high' })
    const before = await storage.get(SETTINGS_KEY)

    const state = createInitialState(0)
    state.run.bytes = D(10)
    const engine = new GameEngine(
      { stages: [{ id: 'solo_hacker', order: 0, nameKey: 'stage.solo_hacker', requirement: { kind: 'always' } }], equipment: [], agents: [], upgrades: [], quantumNodes: [] },
      state,
      DEFAULT_CONFIG,
    )
    const persistence = createPersistence(engine, new SaveManager(storage))
    await resetGame(engine, persistence)
    persistence.dispose()

    expect(await storage.get(SETTINGS_KEY)).toBe(before)
    expect((await loadSettings(storage, ['pt-BR'])).current).toMatchObject({ locale: 'en', graphicsQuality: 'high' })
  })
})
