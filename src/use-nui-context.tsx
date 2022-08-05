import createCtx from './utils/create-context'
import { AppContext } from './types'

const [useNuiContext, Provider] = createCtx<AppContext>()

export { Provider }

export default useNuiContext
