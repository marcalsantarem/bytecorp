import { describe, expect, it } from 'vitest'
import { isMessageKey } from '../../i18n'
import { ACCELERATOR_GRANTS, ACCELERATOR_ITEMS, acceleratorItemFor, validateAccelerators } from './accelerators'
import { CATALOG } from './index'

const stageIds = CATALOG.stages.map((s) => s.id)
const check = (items = ACCELERATOR_ITEMS, grants = ACCELERATOR_GRANTS) => validateAccelerators(items, grants, stageIds, isMessageKey)

describe('catálogo de aceleradores', () => {
  it('é válido e tem os seis itens', () => {
    expect(check()).toEqual([])
    expect(ACCELERATOR_ITEMS).toHaveLength(6)
  })

  it('concede em todo estágio exceto o inicial e não concede no Reboot (D-18)', () => {
    expect(Object.keys(ACCELERATOR_GRANTS.stage)).toEqual(stageIds.slice(1))
    expect(ACCELERATOR_GRANTS.reboot).toEqual([])
  })

  it('toda concessão tem item no catálogo', () => {
    const all = [...ACCELERATOR_GRANTS.reboot, ...Object.values(ACCELERATOR_GRANTS.stage).flat()]
    for (const g of all) expect(acceleratorItemFor(g.multiplier, g.durationMin)).toBeDefined()
  })

  it('toda concessão por marco é 2x (D-18); 5x e 60 min ficam sem concessão', () => {
    const all = Object.values(ACCELERATOR_GRANTS.stage).flat()
    expect(all.every((g) => g.multiplier === 2 && g.durationMin <= 30)).toBe(true)
    expect(Object.fromEntries(Object.entries(ACCELERATOR_GRANTS.stage).map(([s, l]) => [s, l![0]!.durationMin]))).toEqual({
      garage_company: 15, startup_lab: 15, data_center: 30, corporate_network: 15, quantum_facility: 15, mega_corporation: 30,
    })
  })

  it('aceita a tabela de Reboot vazia, mas não a de um estágio', () => {
    expect(check(ACCELERATOR_ITEMS, { stage: ACCELERATOR_GRANTS.stage, reboot: [] })).toEqual([])
    expect(check(ACCELERATOR_ITEMS, { stage: { data_center: [] }, reboot: [] }).join()).toContain('sem concessão')
  })

  it('detecta multiplicador, duração, duplicata e estágio inválidos', () => {
    const bad = { ...ACCELERATOR_ITEMS[0]!, multiplier: 3 as unknown as 2 }
    expect(check([bad])).not.toEqual([])
    const badDur = { ...ACCELERATOR_ITEMS[0]!, durationMin: 45 as unknown as 15 }
    expect(check([badDur])).not.toEqual([])
    const dup = { stage: { garage_company: [{ multiplier: 2, durationMin: 15 }, { multiplier: 2, durationMin: 15 }] }, reboot: ACCELERATOR_GRANTS.reboot } as const
    expect(check(ACCELERATOR_ITEMS, dup as never).join()).toContain('duplicada')
    const noStage = { stage: { solo_hacker: [{ multiplier: 2, durationMin: 15 }] }, reboot: ACCELERATOR_GRANTS.reboot }
    expect(check(ACCELERATOR_ITEMS, noStage as never).join()).toContain('inicial')
    expect(check([...ACCELERATOR_ITEMS, ACCELERATOR_ITEMS[0]!]).join()).toContain('duplicado')
  })
})
