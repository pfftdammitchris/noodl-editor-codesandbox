import React from 'react'

function createCtx<A extends {} | null>() {
  const ctx = React.createContext<A | undefined>(undefined)

  function useCtx() {
    const c = React.useContext(ctx)

    if (c === undefined) {
      throw new Error(`useCtx mnust be inside a Provider with a value`)
    }

    return c
  }

  return [useCtx, ctx.Provider] as const
}

export default createCtx
