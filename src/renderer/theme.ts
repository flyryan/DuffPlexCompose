import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
        _dark: {
          bg: 'gray.900',
          color: 'white',
        },
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: 'medium',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'blue.400',
      },
    },
    Heading: {
      defaultProps: {
        size: 'lg',
      },
    },
  },
});

export default theme;
