import { describe, expect, it } from 'vitest'
import { isMessageKey } from '../../i18n'
import { CATALOG } from '../catalog'
import { TUTORIAL_STEPS, validateTutorialSteps, type TutorialStepDef } from '../catalog/tutorial'
import { D } from '../decimal'
import { DEFAULT_CONFIG, GameEngine, type EngineConfig } from '../engine'
import type { GameEvents } from '../events'
import { decodeSave, encodeSave } from '../save/codec'
import { createInitialState, type GameState } from '../state'

const config: EngineConfig = { ...DEFAULT_CONFIG, random: () => 0.99 }

function engineWith(state: GameState = createInitialState(0), extra: Partial<EngineConfig> = {}) {
  // Sem conquistas do catálogo, para que desbloqueios automáticos não ativem o passo de conquistas.
  const engine = new GameEngine({ ...CATALOG, achievements: [] }, state, { ...config, ...extra })
  const events: GameEvents['tutorialChanged'][] = []
  engine.events.on('tutorialChanged', (e) => events.push(e))
  return { engine, events }
}

const clickTo = (engine: GameEngine, bytes: number) => {
  while (engine.state.run.bytes.lt(bytes)) engine.click()
}

describe('catálogo do tutorial', () => {
  it('é válido e segue a ordem da Bíblia 16.1', () => {
    expect(validateTutorialSteps(TUTORIAL_STEPS, isMessageKey)).toEqual([])
    expect(TUTORIAL_STEPS.map((s) => s.id)).toEqual([
      'click',
      'firstEquipment',
      'passiveProduction',
      'firstAgent',
      'upgrades',
      'achievements',
      'reboot',
      'quantumTree',
    ])
  })

  it('a validação acusa id duplicado, chave inexistente e ativação manual', () => {
    const bad = { ...TUTORIAL_STEPS[0]!, titleKey: 'nada' as TutorialStepDef['titleKey'], activation: { kind: 'manual' } } as TutorialStepDef
    const problems = validateTutorialSteps([bad, bad], isMessageKey)
    expect(problems.some((p) => p.includes('duplicado'))).toBe(true)
    expect(problems.some((p) => p.includes('"nada"'))).toBe(true)
    expect(problems.some((p) => p.includes('manual'))).toBe(true)
  })
})

describe('tutorial no engine', () => {
  it('novo jogo começa no passo de clique, com alvo de interface', () => {
    const { engine } = engineWith()
    expect(engine.tutorialStep?.id).toBe('click')
    expect(engine.tutorialStep?.target).toBe('click-button')
  })

  it('conclui pela ação e ativa o próximo só quando o marco é atingido', () => {
    const { engine, events } = engineWith()
    engine.click()
    expect(engine.state.meta.tutorial.completedSteps).toEqual(['click'])
    expect(engine.tutorialStep).toBeNull()
    expect(events[0]).toEqual({ step: null, previous: 'click', completed: ['click'], reason: 'progress' })

    clickTo(engine, 15)
    expect(engine.tutorialStep?.id).toBe('firstEquipment')

    engine.buyEquipment('home_router', 'x1')
    expect(engine.state.meta.tutorial.completedSteps).toContain('firstEquipment')
    expect(engine.tutorialStep?.id).toBe('passiveProduction')
  })

  it('passo manual só conclui pela API, que avança ao próximo ativo', () => {
    const { engine, events } = engineWith()
    clickTo(engine, 15)
    engine.buyEquipment('home_router', 'x1')
    engine.advance(60_000)
    expect(engine.tutorialStep?.id).toBe('passiveProduction')
    clickTo(engine, 60) // melhoria de 50 desbloqueada e paga
    expect(engine.completeTutorialStep()).toBe(true)
    expect(engine.tutorialStep?.id).toBe('upgrades')
    expect(events.at(-1)).toMatchObject({ step: 'upgrades', previous: 'passiveProduction', completed: ['passiveProduction'], reason: 'completed' })
    expect(engine.completeTutorialStep('passiveProduction')).toBe(false)
    expect(engine.completeTutorialStep('inexistente')).toBe(false)
  })

  it('passo ativo continua exibido se a ativação deixa de valer', () => {
    const { engine } = engineWith()
    clickTo(engine, 15)
    expect(engine.tutorialStep?.id).toBe('firstEquipment')
    engine.state.run.bytes = D(0)
    engine.advance(1000)
    expect(engine.tutorialStep?.id).toBe('firstEquipment')
  })

  it('dispensar o passo conta como concluído e avança', () => {
    const { engine, events } = engineWith()
    expect(engine.dismissTutorialStep()).toBe(true)
    expect(engine.state.meta.tutorial.completedSteps).toEqual(['click'])
    expect(engine.tutorialStep).toBeNull()
    expect(events.at(-1)?.reason).toBe('stepDismissed')
    expect(engine.dismissTutorialStep()).toBe(false)
  })

  it('dispensar o tutorial inteiro some com os passos e para os eventos', () => {
    const { engine, events } = engineWith()
    expect(engine.dismissTutorial()).toBe(true)
    expect(engine.tutorialStep).toBeNull()
    expect(engine.state.meta.tutorial.dismissed).toBe(true)
    expect(events.at(-1)).toMatchObject({ step: null, previous: 'click', reason: 'tutorialDismissed' })
    const n = events.length
    clickTo(engine, 20)
    engine.buyEquipment('home_router', 'x1')
    expect(engine.tutorialStep).toBeNull()
    expect(engine.completeTutorialStep('passiveProduction')).toBe(false)
    expect(events.length).toBe(n)
    expect(engine.dismissTutorial()).toBe(false)
  })

  it('passos cuja ação já foi feita são concluídos sem aparecer', () => {
    const s = createInitialState(0)
    s.stats.clicks = 10
    s.run.equipment = { home_router: 2 }
    s.run.agents = { [CATALOG.agents[0]!.id]: { count: 1, level: 1 } }
    const { engine } = engineWith(s)
    expect(s.meta.tutorial.completedSteps).toEqual(['click', 'firstEquipment', 'firstAgent'])
    expect(engine.tutorialStep?.id).toBe('passiveProduction')
  })

  it('ativa o Reboot quando habilita, sobrevive a ele e então ativa a árvore Quantum', () => {
    const s = createInitialState(0)
    s.meta.tutorial.completedSteps = ['click', 'firstEquipment', 'passiveProduction', 'firstAgent', 'upgrades', 'achievements']
    let reward = 0
    const { engine } = engineWith(s, { rebootReward: () => reward })
    expect(engine.tutorialStep).toBeNull()
    reward = 2
    engine.advance(1000)
    expect(engine.tutorialStep?.id).toBe('reboot')
    engine.reboot()
    expect(engine.state.meta.tutorial.completedSteps).toContain('reboot')
    expect(engine.state.meta.tutorial.completedSteps).toContain('passiveProduction')
    expect(engine.tutorialStep?.id).toBe('quantumTree')
    engine.buyQuantumNode(CATALOG.quantumNodes.find((n) => n.prerequisites.length === 0)!.id)
    expect(engine.state.meta.tutorial.completedSteps).toContain('quantumTree')
    expect(engine.tutorialStep).toBeNull()
  })

  it('o passo de conquistas ativa com a primeira desbloqueada', () => {
    const s = createInitialState(0)
    s.meta.tutorial.completedSteps = ['click', 'firstEquipment', 'passiveProduction', 'firstAgent', 'upgrades']
    const { engine } = engineWith(s)
    expect(engine.tutorialStep).toBeNull()
    s.meta.achievements.push('qualquer')
    engine.advance(1)
    expect(engine.tutorialStep?.id).toBe('achievements')
    expect(engine.tutorialStep?.target).toBe('achievements-button')
  })

  it('recarga mantém o progresso e recalcula o passo; Novo jogo zera', () => {
    const { engine } = engineWith()
    clickTo(engine, 15)
    engine.buyEquipment('home_router', 'x1')
    engine.completeTutorialStep()
    const decoded = decodeSave(encodeSave(engine.state, 0))
    if (!decoded.ok) throw new Error(decoded.detail)
    expect(decoded.state.meta.tutorial.completedSteps).toEqual(['click', 'firstEquipment', 'passiveProduction'])

    const reloaded = engineWith(decoded.state).engine
    expect(reloaded.state.meta.tutorial.completedSteps).toEqual(['click', 'firstEquipment', 'passiveProduction'])

    const events: unknown[] = []
    engine.events.on('tutorialChanged', (e) => events.push(e))
    engine.replaceState(createInitialState(0))
    expect(engine.state.meta.tutorial).toEqual({ completedSteps: [], dismissed: false })
    expect(engine.tutorialStep?.id).toBe('click')
    expect(events).toEqual([])
  })

  it('tutorial dispensado sobrevive à recarga', () => {
    const { engine } = engineWith()
    engine.dismissTutorial()
    const decoded = decodeSave(encodeSave(engine.state, 0))
    if (!decoded.ok) throw new Error(decoded.detail)
    expect(engineWith(decoded.state).engine.tutorialStep).toBeNull()
  })

  it('passos vêm da configuração (orientado a dados)', () => {
    const steps: TutorialStepDef[] = [
      { ...TUTORIAL_STEPS[0]!, id: 'a', activation: { kind: 'clicks', amount: 2 }, completion: { kind: 'manual' } },
    ]
    const { engine } = engineWith(createInitialState(0), { tutorialSteps: steps })
    expect(engine.tutorialStep).toBeNull()
    engine.click()
    engine.click()
    expect(engine.tutorialStep?.id).toBe('a')
  })
})
