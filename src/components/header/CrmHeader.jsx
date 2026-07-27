import React from "react";
import {
  Users, BarChart2, Settings, Bell, History, KeyRound, LogOut,
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
    <div className="crm-header">
      <div className="crm-header-top">
        <div className="crm-header-user-box">
          <span className="crm-header-username">{userName}</span>
          <button className="crm-header-btn change-pass" onClick={onChangePassword}>
            <KeyRound size={13} /> Đổi mật khẩu
          </button>
          <button className="crm-header-btn logout" onClick={onLogout}>
            <LogOut size={13} /> Đăng xuất
          </button>
        </div>
        <h1 className="crm-header-title">{title}</h1>
      </div>

      <div className="crm-header-nav-wrap">
        <div className="crm-header-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavChange && onNavChange(item.key)}
                className={`crm-header-nav-item ${active ? "active" : ""}`}
              >
                <Icon size={16} />
                {item.label}
                {item.badge ? (
                  <span className="crm-header-nav-badge">{item.badge}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
