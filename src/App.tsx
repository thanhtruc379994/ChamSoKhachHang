import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Alert, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, IconButton, Paper, Stack, TextField, Typography,
} from '@mui/material'
import { Close, Key, Login, Logout, Shield } from '@mui/icons-material'
import CrmCustomerList from './page/customer/CrmCustomerList'
import CrmSettings from './page/setting/CrmSettings'
import CrmTasks from './page/Task/CrmTasks'
import CrmHistory from './page/history/CrmHistory'
import CrmReports from './page/report/CrmReports'
import { readData, writeData } from './data/indexedDb'

function App() {
  const [currentPage, setCurrentPage] = useState('customers')
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('cskh-session') !== 'logged-out')
  const [password, setPassword] = useState('admin')
  const [passwordModal, setPasswordModal] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { readData('account-password').then((saved) => { if (typeof saved === 'string') setPassword(saved) }).catch(console.error) }, [])

  const pageProps = {
    onNavigate: setCurrentPage,
    onChangePassword: () => { setMessage(''); setPasswordModal(true) },
    onLogout: () => setLogoutModal(true),
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const current = String(data.get('current') || '')
    const next = String(data.get('next') || '')
    const confirm = String(data.get('confirm') || '')
    if (current !== password) return setMessage('Mật khẩu hiện tại không đúng.')
    if (next.length < 4) return setMessage('Mật khẩu mới phải có ít nhất 4 ký tự.')
    if (next !== confirm) return setMessage('Xác nhận mật khẩu chưa khớp.')
    await writeData('account-password', next)
    setPassword(next); setMessage('Đổi mật khẩu thành công.')
    setTimeout(() => setPasswordModal(false), 700)
  }

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('username') !== 'admin' || data.get('password') !== password) return setMessage('Tên đăng nhập hoặc mật khẩu không đúng.')
    sessionStorage.setItem('cskh-session', 'active'); setMessage(''); setLoggedIn(true)
  }

  if (!loggedIn) return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default', backgroundImage: 'radial-gradient(circle at 15% 10%, #EADDFF 0, transparent 35%)' }}>
    <Paper component="form" elevation={3} onSubmit={login} sx={{ width: 'min(400px, 100%)', p: { xs: 3, sm: 4 }, borderRadius: 7 }}>
      <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.main' }}><Shield fontSize="large" /></Avatar>
        <Typography variant="h1">Đăng nhập CRM</Typography>
        <Typography color="text.secondary">Quản lý chăm sóc khách hàng</Typography>
      </Stack>
      <Stack spacing={2}>
        <TextField name="username" label="Tên đăng nhập" defaultValue="admin" autoFocus fullWidth />
        <TextField name="password" label="Mật khẩu" type="password" placeholder="Nhập mật khẩu" fullWidth />
        {message && <Alert severity="error">{message}</Alert>}
        <Button type="submit" variant="contained" size="large" startIcon={<Login />}>Đăng nhập</Button>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>Tài khoản mặc định: admin / admin</Typography>
      </Stack>
    </Paper>
  </Box>

  const pages: Record<string, React.ReactNode> = {
    settings: <CrmSettings {...pageProps} />, reminders: <CrmTasks {...pageProps} />,
    history: <CrmHistory {...pageProps} />, reports: <CrmReports {...pageProps} />,
    customers: <CrmCustomerList {...pageProps} />,
  }

  return <Box sx={{ minHeight: '100vh' }}>
    {pages[currentPage] ?? pages.customers}
    <Dialog open={passwordModal} onClose={() => setPasswordModal(false)} component="form" onSubmit={(event: FormEvent<HTMLDivElement>) => changePassword(event as unknown as FormEvent<HTMLFormElement>)} maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Key color="primary" /> Đổi mật khẩu<Box sx={{ flex: 1 }} /><IconButton onClick={() => setPasswordModal(false)}><Close /></IconButton></DialogTitle>
      <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
        <TextField name="current" label="Mật khẩu hiện tại" type="password" autoFocus required />
        <TextField name="next" label="Mật khẩu mới" type="password" required />
        <TextField name="confirm" label="Nhập lại mật khẩu mới" type="password" required />
        {message && <Alert severity={message.includes('thành công') ? 'success' : 'error'}>{message}</Alert>}
      </Stack></DialogContent>
      <DialogActions><Button onClick={() => setPasswordModal(false)}>Hủy</Button><Button variant="contained" type="submit">Cập nhật</Button></DialogActions>
    </Dialog>
    <Dialog open={logoutModal} onClose={() => setLogoutModal(false)} maxWidth="xs">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Logout color="error" /> Đăng xuất?</DialogTitle>
      <DialogContent><DialogContentText>Bạn có chắc muốn đăng xuất khỏi hệ thống?</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setLogoutModal(false)}>Ở lại</Button><Button color="error" variant="contained" onClick={() => { sessionStorage.setItem('cskh-session', 'logged-out'); setLogoutModal(false); setLoggedIn(false) }}>Đăng xuất</Button></DialogActions>
    </Dialog>
  </Box>
}

export default App
