import createCtx from '../../utils/create-context'
import { EditorContext } from '../../types'

const [useEditorCtx, Provider] = createCtx<EditorContext>()

export { useEditorCtx, Provider }
export default useEditorCtx
