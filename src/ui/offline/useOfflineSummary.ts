import { useCallback, useEffect, useState } from 'react'
import type { OfflineResult } from '../../core/progression/offline'
import type { StageId } from '../../core/catalog/types'

// Resultado da ausência pendente de exibição; stageBefore (opcional) é o estágio antes de creditar,
// usado só para avisar de um novo estágio; grants é a contagem de aceleradores concedidos no crédito.
export interface PendingOffline {
  result: OfflineResult
  stageBefore?: StageId
  grants?: number
}

// Interface mínima da fonte: o bootstrap (T-069) a implementa.
export interface OfflineSource {
  peek(): PendingOffline | null
  consume(): PendingOffline | null
  subscribe(listener: () => void): () => void
}

// Ausência creditada menor que isto não abre a janela.
export const MIN_SUMMARY_MS = 60_000

export function shouldShow(pending: PendingOffline | null): pending is PendingOffline {
  return !!pending && pending.result.creditedMs >= MIN_SUMMARY_MS && pending.result.bytes.gt(0)
}

// Entrega o resultado pendente enquanto a janela está aberta; dismiss() consome e fecha.
export function useOfflineSummary(source: OfflineSource): { pending: PendingOffline | null; dismiss: () => void } {
  const [pending, setPending] = useState<PendingOffline | null>(() => {
    const p = source.peek()
    return shouldShow(p) ? p : null
  })

  useEffect(() => {
    const sync = () => {
      const p = source.peek()
      if (shouldShow(p)) setPending(p)
      else if (p) source.consume() // pendente sem ganho: descarta sem abrir
    }
    sync()
    return source.subscribe(sync)
  }, [source])

  const dismiss = useCallback(() => {
    source.consume()
    setPending(null)
  }, [source])

  return { pending, dismiss }
}
