import {useEffect, useState} from 'react'
import type {FormEvent} from 'react'
import {KeyRound, LogIn, ShieldCheck, X} from 'lucide-react'
import CrmCustomerList from './page/customer/CrmCustomerList'
import CrmSettings from './page/setting/CrmSettings'
import CrmTasks from './page/Task/CrmTasks'
import './App.css'
import CrmHistory from "./page/history/CrmHistory";
import CrmReports from './page/report/CrmReports'
import {readData, writeData} from './data/indexedDb'

function App() {
    const [currentPage, setCurrentPage] = useState('customers')
    const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem('cskh-session') !== 'logged-out')
    const [password, setPassword] = useState('admin')
    const [passwordModal, setPasswordModal] = useState(false)
    const [logoutModal, setLogoutModal] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        readData('account-password').then((saved) => {
            if (typeof saved === 'string') setPassword(saved)
        }).catch(console.error)
    }, [])

    const handleNavigate = (page: string) => {
        setCurrentPage(page)
    }

    const pageProps = {
        onNavigate: handleNavigate,
        onChangePassword: () => {
            setMessage('');
            setPasswordModal(true)
        },
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
        setPassword(next)
        setMessage('Đổi mật khẩu thành công.')
        setTimeout(() => setPasswordModal(false), 700)
    }

    const login = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        if (data.get('username') !== 'admin' || data.get('password') !== password) {
            setMessage('Tên đăng nhập hoặc mật khẩu không đúng.')
            return
        }
        sessionStorage.setItem('cskh-session', 'active')
        setMessage('')
        setLoggedIn(true)
    }

    if (!loggedIn) return (
        <div className="crm-login-page">
            <form className="crm-login-card" onSubmit={login}>
                <div className="crm-login-logo"><ShieldCheck size={30}/></div>
                <h1>Đăng nhập CRM</h1><p>Quản lý chăm sóc khách hàng</p>
                <label>Tên đăng nhập<input name="username" defaultValue="admin" autoFocus/></label>
                <label>Mật khẩu<input name="password" type="password" placeholder="Nhập mật khẩu"/></label>
                {message && <div className="crm-auth-error">{message}</div>}
                <button><LogIn size={17}/> Đăng nhập</button>
                <small>Tài khoản mặc định: admin / admin</small>
            </form>
        </div>
    )

    return (
        <div className="app-container">
            {currentPage === 'settings' ? (
                <CrmSettings {...pageProps}/>
            ) : currentPage === 'reminders' ? (
                <CrmTasks {...pageProps}/>
            ) : currentPage === 'history' ? (
                <CrmHistory {...pageProps}/>
            ) : currentPage === 'reports' ? (
                <CrmReports {...pageProps}/>
            ) : (
                <CrmCustomerList {...pageProps}/>
            )}
            {passwordModal && <div className="crm-auth-overlay" onMouseDown={() => setPasswordModal(false)}>
                <form className="crm-auth-dialog" onSubmit={changePassword} onMouseDown={(e) => e.stopPropagation()}>
                    <div className="crm-auth-title"><span><KeyRound size={19}/> Đổi mật khẩu</span>
                        <button type="button" onClick={() => setPasswordModal(false)}><X size={18}/></button>
                    </div>
                    <label>Mật khẩu hiện tại<input name="current" type="password" autoFocus required/></label>
                    <label>Mật khẩu mới<input name="next" type="password" required/></label>
                    <label>Nhập lại mật khẩu mới<input name="confirm" type="password" required/></label>
                    {message && <div
                        className={message.includes('thành công') ? 'crm-auth-success' : 'crm-auth-error'}>{message}</div>}
                    <div className="crm-auth-actions">
                        <button type="button" onClick={() => setPasswordModal(false)}>Hủy</button>
                        <button className="primary">Cập nhật</button>
                    </div>
                </form>
            </div>}
            {logoutModal && <div className="crm-auth-overlay" onMouseDown={() => setLogoutModal(false)}>
                <div className="crm-logout-dialog" onMouseDown={(e) => e.stopPropagation()}>
                    <div className="crm-logout-icon"><LogIn size={22}/></div>
                    <h3>Đăng xuất?</h3>
                    <p>Bạn có chắc muốn đăng xuất khỏi hệ thống?</p>
                    <div className="crm-auth-actions">
                        <button onClick={() => setLogoutModal(false)}>Ở lại</button>
                        <button className="danger" onClick={() => {
                            sessionStorage.setItem('cskh-session', 'logged-out');
                            setLogoutModal(false);
                            setLoggedIn(false)
                        }}>Đăng xuất
                        </button>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default App
