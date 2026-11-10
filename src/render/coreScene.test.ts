import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ONE } from '../core/decimal'
import { EventBus, type GameEvents } from '../core/events'
import { mountCoreScene } from './coreScene'

// Contexto 2D falso: qualquer método vira função vazia, propriedades aceitam escrita.
function fakeContext() {
  const gradient = { addColorStop: vi.fn() }
  const calls: string[] = []
  const target: Record<string | symbol, unknown> = {}
  return {
    calls,
    ctx: new Proxy(target, {
      get(obj, key) {
        if (key in obj) return obj[key]
        if (key === 'createRadialGradient') return () => gradient
        return (..._args: unknown[]) => {
          calls.push(String(key))
        }
      },
      set(obj, key, value) {
        obj[key] = value
        return true
      },
    }),
  }
}

function fakeCanvas() {
  const { ctx, calls } = fakeContext()
  const canvas = { width: 0, height: 0, clientWidth: 200, clientHeight: 100, getContext: () => ctx }
  return { canvas: canvas as unknown as HTMLCanvasElement, calls }
}

let frames: Map<number, FrameRequestCallback>
let nextId: number

function runFrame(time: number) {
  const pending = [...frames.entries()]
  frames.clear()
  for (const [, cb] of pending) cb(time)
}

beforeEach(() => {
  frames = new Map()
  nextId = 1
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++
    frames.set(id, cb)
    return id
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('devicePixelRatio', 2)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// Conta inscrições ativas em click envolvendo bus.on, sem acessar campos privados.
const active = new WeakMap<EventBus<GameEvents>, { click: number }>()

function trackedBus() {
  const bus = new EventBus<GameEvents>()
  const counts = { click: 0 }
  active.set(bus, counts)
  const original = bus.on.bind(bus)
  bus.on = ((type, handler) => {
    const off = original(type, handler)
    if (type !== 'click') return off
    counts.click++
    let done = false
    return () => {
      if (!done) counts.click--
      done = true
      return off()
    }
  }) as typeof bus.on
  return bus
}

function clickHandlers(bus: EventBus<GameEvents>) {
  return active.get(bus)?.click ?? 0
}

describe('mountCoreScene', () => {
  it('inscreve em click, desenha e ajusta à densidade de pixels', () => {
    const bus = trackedBus()
    const { canvas, calls } = fakeCanvas()
    const unmount = mountCoreScene(canvas, bus)

    expect(clickHandlers(bus)).toBe(1)
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(200)
    expect(frames.size).toBe(1)

    runFrame(0)
    bus.emit('click', { gained: ONE, critical: true })
    runFrame(16)
    expect(calls).toContain('arc')
    expect(frames.size).toBe(1)
    unmount()
  })

  it('desmontar cancela o loop e remove a inscrição', () => {
    const bus = trackedBus()
    const { canvas } = fakeCanvas()
    const unmount = mountCoreScene(canvas, bus)
    runFrame(0)

    unmount()
    expect(frames.size).toBe(0)
    expect(clickHandlers(bus)).toBe(0)
  })

  it('desconecta o observador de tamanho e o listener de movimento reduzido', () => {
    const disconnect = vi.fn()
    const observe = vi.fn()
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = observe
        disconnect = disconnect
      },
    )
    const query = { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    vi.stubGlobal('matchMedia', () => query)

    const bus = trackedBus()
    const { canvas } = fakeCanvas()
    const unmount = mountCoreScene(canvas, bus)
    expect(observe).toHaveBeenCalledWith(canvas)
    bus.emit('click', { gained: ONE, critical: true })
    runFrame(0)

    unmount()
    expect(disconnect).toHaveBeenCalled()
    expect(query.removeEventListener).toHaveBeenCalledWith('change', query.addEventListener.mock.calls[0]![1])
  })
})
