import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#090d16',
        color: '#f3f4f6',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      },
    },
  },
  colors: {
    brand: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: '#04acc6',
      600: '#0097a7',
      700: '#00838f',
      800: '#006064',
      900: '#004d40',
    },
    blue: {
      50: '#e0f7fa',
      100: '#b2ebf2',
      200: '#80deea',
      300: '#4dd0e1',
      400: '#26c6da',
      500: '#04acc6',
      600: '#0097a7',
      700: '#00838f',
      800: '#006064',
      900: '#004d40',
    },
    dark: {
      bg: '#090d16',
      card: '#111827',
      sidebar: '#0b1120',
      border: 'rgba(255, 255, 255, 0.08)',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
  },
});

export default theme;
