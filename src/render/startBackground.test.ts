import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  MAX_LINKS_PER_NODE,
  MAX_NODES,
  MIN_NODES,
  QUALITY_PROFILES,
  createRng,
  drawStartFrame,
  generateScene,
  mountStartBackground,
  nodeCount,
  packetPosition,
  resolveQuality,
} from './startBackground'

function fakeContext() {
  const calls: string[] = []
  const gradient = { addColorStop: () => {} }
  const target: Record<string | symbol, unknown> = {}
  const ctx = new Proxy(target, {
    get(obj, key) {
      if (key in obj) return obj[key]
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => gradient
      return () => {
        calls.push(String(key))
      }
    },
    set(obj, key, value) {
      obj[key] = value
      return true
    },
  })
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls }
}

describe('geração da cena', () => {
  it('é determinística pela semente', () => {
    expect(generateScene(1280, 720, 'medium', 7)).toEqual(generateScene(1280, 720, 'medium', 7))
    const r = createRng(1)
    const v = r()
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThan(1)
  })

  it('respeita os limites de nós por qualidade e tela', () => {
    expect(nodeCount('low', 375, 812)).toBeLessThan(nodeCount('high', 375, 812))
    expect(nodeCount('high', 10000, 10000)).toBeLessThanOrEqual(MAX_NODES)
    expect(nodeCount('low', 0, 0)).toBe(MIN_NODES)
    for (const q of ['low', 'medium', 'high'] as const) {
      for (const [w, h] of [[375, 812], [1280, 720], [3840, 2160]] as const) {
        const s = generateScene(w, h, q)
        expect(s.nodes.length).toBe(nodeCount(q, w, h))
        expect(s.packets.length).toBeLessThanOrEqual(QUALITY_PROFILES[q].packets)
      }
    }
  })

  it('mantém nós no quadro, ligações válidas e grau limitado', () => {
    const s = generateScene(1280, 720, 'high')
    const degree = new Array<number>(s.nodes.length).fill(0)
    for (const n of s.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0)
      expect(n.x).toBeLessThanOrEqual(1)
      expect(n.y).toBeGreaterThanOrEqual(0)
      expect(n.y).toBeLessThanOrEqual(1)
    }
    const keys = new Set<string>()
    for (const l of s.links) {
      expect(l.a).toBeLessThan(l.b)
      expect(l.b).toBeLessThan(s.nodes.length)
      keys.add(`${l.a}-${l.b}`)
      degree[l.a]!++
      degree[l.b]!++
    }
    expect(keys.size).toBe(s.links.length)
    expect(Math.max(...degree)).toBeLessThanOrEqual(MAX_LINKS_PER_NODE)
    for (const p of s.packets) expect(p.link).toBeLessThan(s.links.length)
  })

  it('pacotes ficam sobre a ligação e dependem só do tempo', () => {
    const s = generateScene(1280, 720, 'medium')
    const packet = s.packets[0]!
    const link = s.links[packet.link]!
    const a = s.nodes[link.a]!
    const b = s.nodes[link.b]!
    for (const t of [0, 123, 5000, 99999]) {
      const p = packetPosition(s, packet, t)
      expect(p.x).toBeGreaterThanOrEqual(Math.min(a.x, b.x) - 1e-9)
      expect(p.x).toBeLessThanOrEqual(Math.max(a.x, b.x) + 1e-9)
      expect(packetPosition(s, packet, t)).toEqual(p)
    }
  })
})

describe('qualidade', () => {
  it('auto escolhe baixa em aparelho fraco e média no resto', () => {
    expect(resolveQuality('auto', { cores: 2 })).toBe('low')
    expect(resolveQuality('auto', { cores: 8 })).toBe('medium')
    expect(resolveQuality('high', { cores: 2 })).toBe('high')
  })
})

describe('desenho', () => {
  it('quadro reduzido ignora o tempo', () => {
    const s = generateScene(375, 812, 'low')
    const a = fakeContext()
    const b = fakeContext()
    drawStartFrame(a.ctx, s, 0, true)
    drawStartFrame(b.ctx, s, 7777, true)
    expect(a.calls).toEqual(b.calls)
    expect(a.calls).toContain('fillRect')
  })
})

describe('montagem', () => {
  let frames: Map<number, FrameRequestCallback>
  let nextId: number

  beforeEach(() => {
    frames = new Map()
    nextId = 1
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      const id = nextId++
      frames.set(id, cb)
      return id
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    vi.stubGlobal('devicePixelRatio', 3)
  })

  afterEach(() => vi.unstubAllGlobals())

  function fakeCanvas() {
    const { ctx, calls } = fakeContext()
    const canvas = { width: 0, height: 0, clientWidth: 375, clientHeight: 812, getContext: () => ctx }
    return { canvas: canvas as unknown as HTMLCanvasElement, calls }
  }

  it('limita a densidade de pixels pela qualidade', () => {
    const { canvas } = fakeCanvas()
    const c = mountStartBackground(canvas, { quality: 'low', reducedMotion: false })
    expect(canvas.width).toBe(375)
    c.setQuality('high')
    expect(canvas.width).toBe(750)
    c.stop()
  })

  it('anima por quadros e para ao desmontar', () => {
    const { canvas } = fakeCanvas()
    const c = mountStartBackground(canvas, { quality: 'medium', reducedMotion: false })
    expect(frames.size).toBe(1)
    c.stop()
    expect(frames.size).toBe(0)
  })

  it('com movimento reduzido desenha só um quadro estático', () => {
    const { canvas, calls } = fakeCanvas()
    const c = mountStartBackground(canvas, { quality: 'medium', reducedMotion: true })
    expect(frames.size).toBe(0)
    expect(calls).toContain('fillRect')
    c.stop()
  })
})
