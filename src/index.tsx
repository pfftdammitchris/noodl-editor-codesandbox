import { StrictMode } from 'react'
// @ts-expect-error
import * as ReactDOMClient from 'react-dom/client'
import { ChakraProvider, createStandaloneToast } from '@chakra-ui/react'
import { Global } from '@emotion/react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { RecoilRoot } from 'recoil'
import theme from './theme'
import App from './App'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const { ToastContainer } = createStandaloneToast()
const rootElement = document.getElementById('root')
const root = ReactDOMClient.createRoot(rootElement)

function Fonts() {
  return (
    <Global
      styles={`
        @font-face {
          font-family: Raleway;
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('./fonts/raleway-all-400-normal.woff') format('woff'), url('./fonts/raleway-all-400-normal.woff') format('woff');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        @font-face {
          font-family: 'Open Sans';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('./fonts/open-sans-all-400-normal.woff') format('woff'), url('./fonts/open-sans-all-400-normal.woff') format('woff');
          unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        `}
    />
  )
}

root.render(
  <StrictMode>
    <DndProvider backend={HTML5Backend}>
      <Fonts />
      <ChakraProvider theme={theme}>
        <RecoilRoot>
          <App />
        </RecoilRoot>
        <ToastContainer />
      </ChakraProvider>
    </DndProvider>
  </StrictMode>,
)
