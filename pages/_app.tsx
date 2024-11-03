import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import '../styles/globals.css'
import { NavigtionProvider } from "../src/contexts/navigation.context"
import { ApolloProvider } from "@apollo/client"
import client from "../lib/apollo"
// Supports weights 100-900
import '@fontsource-variable/inter';

const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        fontFamily: "'Inter Variable', sans-serif",
      },
    },
    FormLabel: {
      baseStyle: {
        fontFamily: "'Inter Variable', sans-serif",
      },
    },
    StatLabel: {
      baseStyle: {
        fontFamily: "'Inter Variable', sans-serif",
      },
    },
    Text: {
      baseStyle: {
        fontFamily: "'Inter Variable', sans-serif", 
      },
    }
  },
  fonts: {
    heading: "'Inter Variable', sans-serif",
  },
  fontSizes: {},
  breakpoints: {
    sm: "320px",
    md: "768px",
    lg: "960px",
    xl: "1200px",
  },
  styles: {
    global: (props) => ({
      'html, body': {
        background: props.colorMode === 'dark' ? '#121212' : '#121212',
      },
      a: {
        color: '#2AD3FF',
      },
      '@keyframes coinFlip': {
        '0%, 100%': { transform: 'rotateY(0deg)' },
        '50%': { transform: 'rotateY(180deg)' },
      },
    }),
  },
});

function App({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <ApolloProvider client={client}>
        <NavigtionProvider>
          <Component {...pageProps} />
        </NavigtionProvider>
      </ApolloProvider>
    </ChakraProvider>
  )
}

export default App
