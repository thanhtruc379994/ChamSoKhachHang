import React from "react";
import {
  Users, BarChart2, Settings, Bell, History, KeyRound, LogOut, Sparkles,
} from "lucide-react";
import "./CrmHeader.css";

const DEFAULT_NAV_ITEMS = [
  { key: "customers", label: "Khách hàng", icon: Users },
  { key: "reports", label: "Báo cáo", icon: BarChart2 },
  { key: "settings", label: "Cài đặt", icon: Settings },
  { key: "reminders", label: "Nhắc việc", icon: Bell, badge: 4 },
  { key: "history", label: "Lịch sử", icon: History },
];

/**
 * Header dùng chung cho các trang trong hệ thống CRM.
 *
 * Props:
 * - userName: tên hiển thị (mặc định "Administrator")
 * - title: tiêu đề trang, vd "Quản lý chăm sóc khách hàng"
 * - activeNav: key của mục đang active, vd "history"
 * - navItems: mảng tuỳ chỉnh [{ key, label, icon, badge }]
 * - onNavChange(key): callback khi bấm 1 mục nav
 * - onChangePassword / onLogout: callback cho 2 nút góc trái
 */
export default function CrmHeader({
  userName = "Administrator",
  title = "Quản lý chăm sóc khách hàng",
  activeNav = "customers",
  navItems = DEFAULT_NAV_ITEMS,
  onNavChange,
  onChangePassword,
  onLogout,
}) {
  return (
    <aside className="crm-header">
      <div className="crm-header-brand">
        <span className="crm-header-brand-mark"><Sparkles size={20} /></span>
        <span><b>Chăm sóc KH</b><small>Customer workspace</small></span>
      </div>

      <div className="crm-header-context">
        <span>KHÔNG GIAN LÀM VIỆC</span>
        <h1 className="crm-header-title">{title}</h1>
      </div>

      <nav className="crm-header-nav" aria-label="Điều hướng chính">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavChange && onNavChange(item.key)}
              className={`crm-header-nav-item ${active ? "active" : ""}`}
            >
              <span className="crm-nav-icon"><Icon size={18} /></span>
              <span>{item.label}</span>
              {item.badge ? <span className="crm-header-nav-badge">{item.badge}</span> : null}
            </button>
          );
        })}
      </nav>

      <div className="crm-header-user-box">
        <span className="crm-header-avatar">{userName.slice(0, 1).toUpperCase()}</span>
        <span className="crm-header-username"><b>{userName}</b><small>Quản trị hệ thống</small></span>
        <div className="crm-header-user-actions">
          <button className="crm-header-btn change-pass" onClick={onChangePassword} title="Đổi mật khẩu">
            <KeyRound size={16} />
          </button>
          <button className="crm-header-btn logout" onClick={onLogout} title="Đăng xuất">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
