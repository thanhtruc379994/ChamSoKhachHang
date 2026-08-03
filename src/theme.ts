import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6750A4', light: '#EADDFF', dark: '#4F378B' },
    secondary: { main: '#625B71' },
    background: { default: '#FFFBFE', paper: '#FFFFFF' },
    error: { main: '#B3261E' },
    success: { main: '#2E7D32' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'Roboto, "Segoe UI", Arial, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
    h1: { fontSize: '1.75rem', fontWeight: 600 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.125rem', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 20 } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #E7E0EC', boxShadow: '0 1px 3px rgba(0,0,0,.08)' } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
    MuiDialog: { defaultProps: { fullWidth: true }, styleOverrides: { paper: { borderRadius: 28 } } },
    MuiTableCell: { styleOverrides: { head: { background: '#F7F2FA', color: '#49454F', fontWeight: 700 }, root: { borderColor: '#E7E0EC' } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
})

export default theme
