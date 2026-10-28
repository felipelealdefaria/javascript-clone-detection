import { useEffect, useReducer } from 'react'

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...state, loading: true }
    case 'success':
      return { data: action.data, error: null, loading: false }
    case 'failure':
      return { data: null, error: action.error, loading: false }
    default:
      return state
  }
}

export function useRemoteData(endpoint) {
  const [state, dispatch] = useReducer(reducer, { data: null, error: null, loading: true })

  useEffect(() => {
    const controller = new AbortController()
    dispatch({ type: 'start' })
    ;(async () => {
      try {
        const response = await fetch(endpoint, { signal: controller.signal })
        dispatch({ type: 'success', data: await response.json() })
      } catch (error) {
        if (error.name !== 'AbortError') dispatch({ type: 'failure', error })
      }
    })()
    return () => controller.abort()
  }, [endpoint])

  return state
}
