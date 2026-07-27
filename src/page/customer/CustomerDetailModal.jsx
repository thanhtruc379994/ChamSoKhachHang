import React, { useState } from "react";
import { X, Phone, Link2, User, Calendar, MapPin, Plus, Pencil, Trash2, PhoneCall, Clock, Bell } from "lucide-react";
import "./CustomerDetailModal.css";

const STATUS_OPTIONS = [
  "Khách hàng mới",
  "Đã gửi thông tin",
  "Đang thuyết phục",
  "Đã gửi báo giá",
  "Đã chốt",
];

const STATUS_CLASS = {
  "Khách hàng mới": "badge-new",
  "Đã gửi thông tin": "badge-sent-info",
  "Đang thuyết phục": "badge-persuading",
  "Đã gửi báo giá": "badge-quoted",
  "Đã chốt": "badge-closed",
};

function fmtMoney(n) {
  if (n === null || n === undefined) return "0";
  return n.toLocaleString("vi-VN");
}

export default function CustomerDetailModal({ customer, onClose, onStatusChange }) {
  const [showCalls, setShowCalls] = useState(false);

  if (!customer) return null;

  const {
    id, name, status, phone, source, staff, createdDate,
    address, area, note, orders = [], careHistory = [], calls = [],
  } = customer;

  const revenue = orders.reduce((sum, o) => sum + (o.value || 0), 0);
  const totalCalls = calls.reduce((sum, c) => sum + (c.count || 0), 0);
  const statusCls = STATUS_CLASS[status] || "";
  const initial = name.replace(/^(Anh|Chị)\s+/i, "").charAt(0).toUpperCase();

  return (
    <div className="cdm-overlay" onClick={onClose}>
      <div className="cdm-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="cdm-header">
          <div className="cdm-header-left">
            <div className="cdm-avatar">{initial}</div>
            <div>
              <span className="cdm-name">{name}</span>
              <span className="cdm-id">(ID: {id})</span>
            </div>
          </div>
          <div className="cdm-header-right">
            <div className={`cdm-status-wrap ${statusCls}`}>
              <select
                className="cdm-status-select"
                value={status}
                onChange={(e) => onStatusChange && onStatusChange(id, e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <button className="cdm-close-btn" onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="cdm-stats">
          <div className="cdm-stat">
            <span className="cdm-stat-label">Doanh thu</span>
            <span className="cdm-stat-value revenue">{fmtMoney(revenue)}</span>
          </div>
          <div className="cdm-stat-divider" />
          <div className="cdm-stat">
            <span className="cdm-stat-label">Số đơn</span>
            <span className="cdm-stat-value">{orders.length}</span>
          </div>
          <div className="cdm-stat-divider" />
          <div className="cdm-stat">
            <span className="cdm-stat-label">Lần chăm sóc</span>
            <span className="cdm-stat-value">{careHistory.length}</span>
          </div>
          <div className="cdm-stat-divider" />
          <button className="cdm-stat cdm-stat-clickable" onClick={() => setShowCalls(true)}>
            <span className="cdm-stat-label"><PhoneCall size={13} /> Tổng cuộc gọi</span>
            <span className="cdm-stat-value">{totalCalls}</span>
          </button>
        </div>

        {/* Contact info */}
        <div className="cdm-card">
          <h3 className="cdm-card-title">Thông tin liên hệ</h3>
          <div className="cdm-info-grid">
            <div className="cdm-info-item"><Phone size={14} /><span className="cdm-info-label">Điện thoại:</span><span className="cdm-info-value">{phone}</span></div>
            <div className="cdm-info-item"><Link2 size={14} /><span className="cdm-info-label">Nguồn:</span><span className="cdm-info-value">{source}</span></div>
            <div className="cdm-info-item"><User size={14} /><span className="cdm-info-label">Phụ trách:</span><span className="cdm-info-value">{staff}</span></div>
            <div className="cdm-info-item"><Calendar size={14} /><span className="cdm-info-label">Ngày tạo:</span><span className="cdm-info-value">{createdDate}</span></div>
            <div className="cdm-info-item"><MapPin size={14} /><span className="cdm-info-label">Địa chỉ:</span><span className="cdm-info-value">{address || "---"}</span></div>
            <div className="cdm-info-item"><MapPin size={14} /><span className="cdm-info-label">Khu vực:</span><span className="cdm-info-value">{area}</span></div>
          </div>
        </div>

        {/* Notes */}
        <div className="cdm-card">
          <h3 className="cdm-card-title">Ghi chú</h3>
          <div className="cdm-note-box">{note || "---"}</div>
        </div>

        {/* Orders */}
        <div className="cdm-card">
          <div className="cdm-card-header">
            <h3 className="cdm-card-title">Đơn hàng ({orders.length})</h3>
            <button className="cdm-add-btn"><Plus size={14} /> Thêm</button>
          </div>
          {orders.length > 0 ? (
            <table className="cdm-table">
              <thead>
                <tr><th>Mã đơn</th><th>Ngày chốt</th><th>Giá trị</th><th /></tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.code}>
                    <td>{o.code}</td>
                    <td>{o.date}</td>
                    <td className="cdm-money">{fmtMoney(o.value)}</td>
                    <td>
                      <div className="cdm-row-actions">
                        <button className="cdm-icon-btn edit"><Pencil size={13} /></button>
                        <button className="cdm-icon-btn delete"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="cdm-empty">Chưa có đơn hàng nào.</p>
          )}
        </div>

        {/* Care history */}
        <div className="cdm-card">
          <div className="cdm-card-header">
            <h3 className="cdm-card-title">Lịch sử chăm sóc</h3>
            <button className="cdm-add-btn"><Plus size={14} /> Thêm</button>
          </div>
          {careHistory.length > 0 ? (
            <div className="cdm-care-list">
              {careHistory.map((h, i) => (
                <div className="cdm-care-item" key={i}>
                  <div className="cdm-care-top">
                    <span className="cdm-care-date">{h.date} <span className="cdm-care-by">- {h.by}</span></span>
                    {h.nextDate && (
                      <span className="cdm-care-next"><Bell size={12} /> {h.nextDate}</span>
                    )}
                  </div>
                  <div className="cdm-care-body">
                    <span>{h.text}</span>
                    <div className="cdm-row-actions">
                      <button className="cdm-icon-btn edit"><Pencil size={13} /></button>
                      <button className="cdm-icon-btn delete"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="cdm-empty">Chưa có lịch sử chăm sóc.</p>
          )}
        </div>
      </div>

      {/* Daily calls side popup */}
      {showCalls && (
        <div className="cdm-calls-panel" onClick={(e) => e.stopPropagation()}>
          <div className="cdm-calls-header">
            <span><Phone size={15} /> Số cuộc gọi hàng ngày</span>
            <button className="cdm-close-btn" onClick={() => setShowCalls(false)} aria-label="Đóng">
              <X size={16} />
            </button>
          </div>
          <div className="cdm-calls-total">
            Tổng: <b>{totalCalls}</b> cuộc gọi
            <button className="cdm-add-btn small"><Plus size={13} /> Thêm</button>
          </div>
          <div className="cdm-calls-list">
            {calls.map((c, i) => (
              <div className="cdm-call-item" key={i}>
                <div className="cdm-call-top">
                  <span>{c.date}</span>
                  {c.isToday && <span className="cdm-call-today">Hôm nay</span>}
                </div>
                <div className="cdm-call-bottom">
                  <span>Số cuộc gọi: <b>{c.count}</b></span>
                  <div className="cdm-row-actions">
                    <button className="cdm-icon-btn edit"><Pencil size={13} /></button>
                    <button className="cdm-icon-btn delete"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
