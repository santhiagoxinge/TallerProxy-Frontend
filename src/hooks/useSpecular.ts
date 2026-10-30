import { useCallback, useRef } from 'react'
import type { PointerEvent } from 'react'

/**
 * Feeds the pointer position into --mx / --my so a glass surface can render a specular
 * highlight that follows the cursor. Writes CSS variables directly, so it never re-renders.
 */
export function useSpecular<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const element = ref.current
    if (!element || event.pointerType === 'touch') return
    const rect = element.getBoundingClientRect()
    element.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    element.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }, [])

  return { ref, onPointerMove }
}
