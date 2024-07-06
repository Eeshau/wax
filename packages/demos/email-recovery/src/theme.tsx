// theme.tsx
import { createTheme } from '@mui/material/styles';

// Define your Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#000000',
    },
    secondary: {
      main: '#8E8E8E',
    },
    accent: {
      main: '#FF4081', // Choose your accent color here
    },
  },

  typography: {
    fontFamily: "Space Grotesk",
    h1: {
      // fontFamily: berkeleyOldStyle.style.fontFamily, // Use Berkeley Old Style for h1
      fontSize: '5rem', // Default font size for the smallest screens (xs)
      letterSpacing: -2,
      fontWeight: '400'
    }
  },

  components: {
  },
});

export default theme;
