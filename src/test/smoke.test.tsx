import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NeonPanel } from '../ui/components/NeonPanel'
import { I18nProvider, useI18n } from '../ui/i18n'

function Title() {
  const { t } = useI18n()
  return <h1>{t('app.title')}</h1>
}

describe('ambiente de componentes', () => {
  it('renderiza componente real com I18nProvider', () => {
    render(
      <I18nProvider>
        <NeonPanel>
          <Title />
        </NeonPanel>
      </I18nProvider>,
    )
    expect(screen.getByRole('heading')).toBeInTheDocument()
    expect(screen.getByRole('heading').textContent).toBeTruthy()
    expect(document.title).toContain('v')
  })
})
