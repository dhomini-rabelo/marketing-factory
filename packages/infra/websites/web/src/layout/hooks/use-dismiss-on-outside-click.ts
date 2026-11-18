import { useEffect, useRef } from 'react'

export function useDismissOnOutsideClick(isActive: boolean, onDismiss: () => void) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) return

    function handlePointerDown(event: MouseEvent) {
      const container = containerRef.current
      if (container && !container.contains(event.target as Node)) onDismiss()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onDismiss()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, onDismiss])

  return containerRef
}
