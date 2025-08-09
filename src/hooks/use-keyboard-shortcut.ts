import { useEffect, useCallback } from 'react'

interface KeyboardShortcutOptions {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: (event: KeyboardEvent) => void
) {
  const { key, ctrlKey = false, metaKey = false, shiftKey = false, altKey = false, preventDefault = true, stopPropagation = true } = options

  const handler = useCallback((event: KeyboardEvent) => {
    const keyMatches = event.key.toLowerCase() === key.toLowerCase()
    const ctrlMatches = event.ctrlKey === ctrlKey
    const metaMatches = event.metaKey === metaKey
    const shiftMatches = event.shiftKey === shiftKey
    const altMatches = event.altKey === altKey

    if (keyMatches && ctrlMatches && metaMatches && shiftMatches && altMatches) {
      if (preventDefault) {
        event.preventDefault()
      }
      if (stopPropagation) {
        event.stopPropagation()
      }
      callback(event)
    }
  }, [key, ctrlKey, metaKey, shiftKey, altKey, preventDefault, stopPropagation, callback])

  useEffect(() => {
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handler])
}