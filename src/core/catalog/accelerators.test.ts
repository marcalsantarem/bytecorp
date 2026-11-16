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

  it('concede em todo estágio exceto o inicial, e em cada Reboot', () => {
    expect(Object.keys(ACCELERATOR_GRANTS.stage)).toEqual(stageIds.slice(1))
    expect(ACCELERATOR_GRANTS.reboot.length).toBeGreaterThan(0)
  })

  it('toda concessão tem item no catálogo', () => {
    const all = [...ACCELERATOR_GRANTS.reboot, ...Object.values(ACCELERATOR_GRANTS.stage).flat()]
    for (const g of all) expect(acceleratorItemFor(g.multiplier, g.durationMin)).toBeDefined()
  })

  it('o 5x só aparece a partir da Corporate Network e nunca em Reboot', () => {
    expect(ACCELERATOR_GRANTS.reboot.every((g) => g.multiplier === 2)).toBe(true)
    for (const s of ['garage_company', 'startup_lab', 'data_center'] as const) {
      expect(ACCELERATOR_GRANTS.stage[s]?.every((g) => g.multiplier === 2)).toBe(true)
    }
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
