'use client'

import { useState } from 'react'

type ActionState = {
  loading: boolean
  error: string | null
}

export function useActionState<T extends (...args: any[]) => Promise<any>>(
  action: T
): [ActionState, T] {
  const [state, setState] = useState<ActionState>({ loading: false, error: null })

  const wrappedAction = ((...args: Parameters<T>) => {
    setState({ loading: true, error: null })
    return action(...args).then(
      result => {
        setState({ loading: false, error: null })
        return result
      },
      error => {
        setState({ loading: false, error: error instanceof Error ? error.message : 'An error occurred' })
        throw error
      }
    )
  }) as T

  return [state, wrappedAction]
}