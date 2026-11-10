import type { StageId } from '../catalog/types'
import { D } from '../decimal'
import type { GameState } from '../state'

// Formato persistido. Decimal vira string; tudo mais é JSON simples.
// Ao mudar o formato: incrementar SAVE_VERSION e registrar a migração em MIGRATIONS.
export const SAVE_VERSION = 1

export interface SaveEnvelope {
  version: number
  savedAt: number
  state: unknown
}

export type DecodeResult =
  | { ok: true; state: GameState; savedAt: number }
  | { ok: false; reason: 'corrupt' | 'invalid' | 'unsupportedVersion'; detail: string }

// Migração da versão N para N+1, aplicada sobre o estado bruto.
export const MIGRATIONS: Record<number, (state: unknown) => unknown> = {}

const STAGE_IDS: readonly StageId[] = [
  'solo_hacker',
  'garage_company',
  'startup_lab',
  'data_center',
  'corporate_network',
  'quantum_facility',
  'mega_corporation',
]

export function encodeSave(state: GameState, savedAt: number): string {
  const { run, meta, stats } = state
  const envelope: SaveEnvelope = {
    version: SAVE_VERSION,
    savedAt,
    state: {
      run: { ...run, bytes: run.bytes.toString(), bytesEarned: run.bytesEarned.toString() },
      meta: { ...meta, quantumCores: meta.quantumCores.toString() },
      stats: {
        ...stats,
        bytesEarnedAllTime: stats.bytesEarnedAllTime.toString(),
        bytesFromClicks: stats.bytesFromClicks.toString(),
        bytesFromProduction: stats.bytesFromProduction.toString(),
      },
    },
  }
  return JSON.stringify(envelope)
}

class InvalidSave extends Error {}

function fail(path: string, expected: string): never {
  throw new InvalidSave(`${path}: esperado ${expected}`)
}

type Obj = Record<string, unknown>

function obj(value: unknown, path: string): Obj {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(path, 'objeto')
  return value as Obj
}

function num(value: unknown, path: string, { integer = false, min = 0 } = {}): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) fail(path, `número >= ${min}`)
  if (integer && !Number.isInteger(value)) fail(path, 'inteiro')
  return value
}

function decimal(value: unknown, path: string) {
  if (typeof value !== 'string') fail(path, 'Decimal em texto')
  let d
  try {
    d = D(value)
  } catch {
    fail(path, 'Decimal em texto')
  }
  if (!Number.isFinite(d.mantissa) || !Number.isFinite(d.exponent) || d.sign() < 0) fail(path, 'Decimal finito e não negativo')
  return d
}

function stringList(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) fail(path, 'lista de textos')
  return [...(value as string[])]
}

function countMap(value: unknown, path: string): Record<string, number> {
  const o = obj(value, path)
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(o)) out[k] = num(v, `${path}.${k}`, { integer: true })
  return out
}

function parseState(raw: unknown): GameState {
  const root = obj(raw, 'state')
  const run = obj(root.run, 'run')
  const meta = obj(root.meta, 'meta')
  const stats = obj(root.stats, 'stats')

  const stage = run.stage
  if (typeof stage !== 'string' || !STAGE_IDS.includes(stage as StageId)) fail('run.stage', 'estágio conhecido')

  const agentsRaw = obj(run.agents, 'run.agents')
  const agents: GameState['run']['agents'] = {}
  for (const [id, a] of Object.entries(agentsRaw)) {
    const agent = obj(a, `run.agents.${id}`)
    agents[id] = {
      count: num(agent.count, `run.agents.${id}.count`, { integer: true }),
      level: num(agent.level, `run.agents.${id}.level`, { integer: true }),
    }
  }

  return {
    run: {
      bytes: decimal(run.bytes, 'run.bytes'),
      bytesEarned: decimal(run.bytesEarned, 'run.bytesEarned'),
      stage: stage as StageId,
      equipment: countMap(run.equipment, 'run.equipment'),
      agents,
      upgrades: stringList(run.upgrades, 'run.upgrades'),
      startedAt: num(run.startedAt, 'run.startedAt'),
    },
    meta: {
      quantumCores: decimal(meta.quantumCores, 'meta.quantumCores'),
      quantumNodes: countMap(meta.quantumNodes, 'meta.quantumNodes'),
      treeResets: num(meta.treeResets, 'meta.treeResets', { integer: true }),
      achievements: stringList(meta.achievements, 'meta.achievements'),
    },
    stats: {
      bytesEarnedAllTime: decimal(stats.bytesEarnedAllTime, 'stats.bytesEarnedAllTime'),
      bytesFromClicks: decimal(stats.bytesFromClicks, 'stats.bytesFromClicks'),
      bytesFromProduction: decimal(stats.bytesFromProduction, 'stats.bytesFromProduction'),
      clicks: num(stats.clicks, 'stats.clicks', { integer: true }),
      criticalClicks: num(stats.criticalClicks, 'stats.criticalClicks', { integer: true }),
      reboots: num(stats.reboots, 'stats.reboots', { integer: true }),
      playTimeMs: num(stats.playTimeMs, 'stats.playTimeMs'),
    },
  }
}

// GDD 21.4: save inválido não é recuperado; o chamador informa o jogador e oferece novo jogo.
export function decodeSave(text: string): DecodeResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, reason: 'corrupt', detail: 'JSON ilegível' }
  }

  try {
    const envelope = obj(parsed, 'envelope')
    let version = num(envelope.version, 'version', { integer: true, min: 1 })
    const savedAt = num(envelope.savedAt, 'savedAt')
    if (version > SAVE_VERSION) {
      return { ok: false, reason: 'unsupportedVersion', detail: `versão ${version} é mais nova que ${SAVE_VERSION}` }
    }
    let state = envelope.state
    while (version < SAVE_VERSION) {
      const migrate = MIGRATIONS[version]
      if (!migrate) return { ok: false, reason: 'unsupportedVersion', detail: `sem migração da versão ${version}` }
      state = migrate(state)
      version++
    }
    return { ok: true, state: parseState(state), savedAt }
  } catch (error) {
    if (error instanceof InvalidSave) return { ok: false, reason: 'invalid', detail: error.message }
    throw error
  }
}
