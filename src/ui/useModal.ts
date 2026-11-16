import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Janelas abertas, da mais antiga para a mais nova; só a última reage ao teclado.
const stack: symbol[] = []

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) => !el.hasAttribute('disabled') && el.tabIndex >= 0 && !el.closest('[hidden], [inert]'),
  )
}

// Comportamento de janela modal: prende Tab e Shift+Tab dentro do container, Esc fecha só a janela do topo
// (com o foco em qualquer lugar) e o foco volta ao elemento anterior ao fechar.
// Os eventos são ouvidos no document para valer também quando o foco está fora da janela.
export function useModal(container: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const id = Symbol('modal')
    const previous = document.activeElement as HTMLElement | null
    stack.push(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return
      const root = container.current
      if (e.key === 'Escape') {
        e.preventDefault()
        closeRef.current()
        return
      }
      if (e.key !== 'Tab' || !root) return
      const items = focusables(root)
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) {
        e.preventDefault()
        return
      }
      const active = document.activeElement
      if (!active || !root.contains(active)) {
        e.preventDefault()
        ;(e.shiftKey ? last : first).focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const i = stack.indexOf(id)
      if (i >= 0) stack.splice(i, 1)
      previous?.focus?.()
    }
  }, [container])
}
