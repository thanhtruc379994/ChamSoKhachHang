import React, { useState } from "react";
import { X, Phone, Link2, User, Calendar, MapPin, Plus, Pencil, Trash2, PhoneCall, Bell } from "lucide-react";
import { getStatusColor } from "../../data/crmOptions";
import "./CustomerDetailModal.css";

function fmtMoney(n) {
  if (n === null || n === undefined) return "0";
  return n.toLocaleString("vi-VN");
}

function getTodayString() {
  const d = new Date();
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function CustomerDetailModal({ customer, statuses, onClose, onStatusChange, onUpdateCustomer }) {
  const [showCalls, setShowCalls] = useState(false);

  // Sub-modal states
  const [orderModal, setOrderModal] = useState({ open: false, index: -1, code: "", date: "", value: "" });
  const [careModal, setCareModal] = useState({ open: false, index: -1, date: "", by: "", text: "", nextDate: "" });
  const [callModal, setCallModal] = useState({ open: false, index: -1, date: "", count: 1, isToday: false });

  if (!customer) return null;

  const {
    id, name, status, phone, source, staff, createdDate,
    address, area, note, orders = [], careHistory = [], calls = [],
  } = customer;

  const revenue = orders.reduce((sum, o) => sum + (o.value || 0), 0);
  const totalCalls = calls.reduce((sum, c) => sum + (c.count || 0), 0);
  const statusColor = getStatusColor(statuses, status);
  const initial = name.replace(/^(Anh|Chị)\s+/i, "").charAt(0).toUpperCase();

  // ----- ORDER HANDLERS -----
  const openAddOrder = () => {
    const nextCodeNum = orders.length + 1;
    const code = `DH${String(nextCodeNum).padStart(4, "0")}`;
    setOrderModal({ open: true, index: -1, code, date: getTodayString(), value: "" });
  };

  const openEditOrder = (order, index) => {
    setOrderModal({ open: true, index, code: order.code, date: order.date, value: String(order.value || "") });
  };

  const handleSaveOrder = (e) => {
    e.preventDefault();
    const val = parseFloat(orderModal.value.replace(/[^0-9.]/g, "")) || 0;
    const newOrder = {
      code: orderModal.code.trim() || `DH${String(orders.length + 1).padStart(4, "0")}`,
      date: orderModal.date.trim() || getTodayString(),
      value: val,
    };
    let nextOrders = [...orders];
    if (orderModal.index >= 0) {
      nextOrders[orderModal.index] = newOrder;
    } else {
      nextOrders.unshift(newOrder);
    }
    const nextRev = nextOrders.reduce((sum, o) => sum + (o.value || 0), 0);
    const updatedCustomer = {
      ...customer,
      orders: nextOrders,
      revenue: fmtMoney(nextRev),
      revenueBadge: nextOrders.length > 0 ? nextOrders.length : null,
    };
    onUpdateCustomer && onUpdateCustomer(updatedCustomer);
    setOrderModal({ open: false, index: -1, code: "", date: "", value: "" });
  };

  const handleDeleteOrder = (index) => {
    const nextOrders = orders.filter((_, i) => i !== index);
    const nextRev = nextOrders.reduce((sum, o) => sum + (o.value || 0), 0);
    const updatedCustomer = {
      ...customer,
      orders: nextOrders,
      revenue: nextOrders.length > 0 ? fmtMoney(nextRev) : null,
      revenueBadge: nextOrders.length > 0 ? nextOrders.length : null,
    };
    onUpdateCustomer && onUpdateCustomer(updatedCustomer);
  };

  // ----- CARE HISTORY HANDLERS -----
  const openAddCare = () => {
    setCareModal({ open: true, index: -1, date: getTodayString(), by: staff || "Administrator", text: "", nextDate: "" });
  };

  const openEditCare = (care, index) => {
    setCareModal({ open: true, index, date: care.date, by: care.by || staff || "Administrator", text: care.text || "", nextDate: care.nextDate || "" });
  };

  const handleSaveCare = (e) => {
    e.preventDefault();
    const newCare = {
      date: careModal.date.trim() || getTodayString(),
      by: careModal.by.trim() || staff || "Administrator",
      text: careModal.text.trim(),
      nextDate: careModal.nextDate.trim() || undefined,
    };
    let nextHistory = [...careHistory];
    if (careModal.index >= 0) {
      nextHistory[careModal.index] = newCare;
    } else {
      nextHistory.unshift(newCare);
    }
    const updatedCustomer = {
      ...customer,
      careHistory: nextHistory,
      lastContact: newCare.date,
      nextDate: newCare.nextDate ? `${newCare.nextDate.split("/")[0]}/${newCare.nextDate.split("/")[1]}/...` : customer.nextDate,
    };
    onUpdateCustomer && onUpdateCustomer(updatedCustomer);
    setCareModal({ open: false, index: -1, date: "", by: "", text: "", nextDate: "" });
  };

  const handleDeleteCare = (index) => {
    const nextHistory = careHistory.filter((_, i) => i !== index);
    const updatedCustomer = {
      ...customer,
      careHistory: nextHistory,
    };
    onUpdateCustomer && onUpdateCustomer(updatedCustomer);
  };

  // ----- CALL HANDLERS -----
  const openAddCall = () => {
    setCallModal({ open: true, index: -1, date: getTodayString(), count: 1, isToday: true });
  };

  const openEditCall = (callItem, index) => {
    setCallModal({ open: true, index, date: callItem.date, count: callItem.count || 1, isToday: Boolean(callItem.isToday) });
  };

  const handleSaveCall = (e) => {
    e.preventDefault();
    const newCall = {
      date: callModal.date.trim() || getTodayString(),
      count: parseInt(callModal.count, 10) || 1,
      isToday: Boolean(callModal.isToday),
    };
    let nextCalls = [...calls];
    if (callModal.index >= 0) {
      nextCalls[callModal.index] = newCall;
    } else {
      nextCalls.unshift(newCall);
    }
    const totalCount = nextCalls.reduce((sum, c) => sum + (c.count || 0), 0);
    const updatedCustomer = {
      ...customer,
      calls: nextCalls,
      call: totalCount > 0 ? totalCount : null,
    };
    onUpdateCustomer && onUpdateCustomer(updatedCustomer);
    setCallModal({ open: false, index: -1, date: "", count: 1, isToday: false });
  };

  const handleDeleteCall = (index) => {
    const nextCalls = calls.filter((_, i) => i !== index);
    const totalCount = nextCalls.reduce((sum, c) => sum + (c.count || 0), 0);
    const updatedCustomer = {
      ...customer,
      calls: nextCalls,
      call: totalCount > 0 ? totalCount : null,
    };
    onUpdateCustomer && onUpdateCustomer(updatedCustomer);
  };

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
            <div className="cdm-status-wrap" style={{ backgroundColor: `${statusColor}18`, color: statusColor }}>
              <select
                className="cdm-status-select"
                value={status}
                onChange={(e) => onStatusChange && onStatusChange(id, e.target.value)}
              >
                {statuses.map((option) => (
                  <option key={option.id} value={option.name}>{option.name}</option>
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
            <button className="cdm-add-btn" onClick={openAddOrder}><Plus size={14} /> Thêm</button>
          </div>
          {orders.length > 0 ? (
            <table className="cdm-table">
              <thead>
                <tr><th>Mã đơn</th><th>Ngày chốt</th><th>Giá trị</th><th /></tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o.code || idx}>
                    <td>{o.code}</td>
                    <td>{o.date}</td>
                    <td className="cdm-money">{fmtMoney(o.value)}</td>
                    <td>
                      <div className="cdm-row-actions">
                        <button className="cdm-icon-btn edit" title="Sửa đơn hàng" onClick={() => openEditOrder(o, idx)}><Pencil size={13} /></button>
                        <button className="cdm-icon-btn delete" title="Xóa đơn hàng" onClick={() => handleDeleteOrder(idx)}><Trash2 size={13} /></button>
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
            <button className="cdm-add-btn" onClick={openAddCare}><Plus size={14} /> Thêm</button>
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
                      <button className="cdm-icon-btn edit" title="Sửa chăm sóc" onClick={() => openEditCare(h, i)}><Pencil size={13} /></button>
                      <button className="cdm-icon-btn delete" title="Xóa chăm sóc" onClick={() => handleDeleteCare(i)}><Trash2 size={13} /></button>
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

      {/* Daily calls side panel */}
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
            <button className="cdm-add-btn small" onClick={openAddCall}><Plus size={13} /> Thêm</button>
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
                    <button className="cdm-icon-btn edit" title="Sửa cuộc gọi" onClick={() => openEditCall(c, i)}><Pencil size={13} /></button>
                    <button className="cdm-icon-btn delete" title="Xóa cuộc gọi" onClick={() => handleDeleteCall(i)}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal dialog: Thêm / Sửa Đơn Hàng */}
      {orderModal.open && (
        <div className="cdm-subdialog-overlay" onClick={() => setOrderModal({ ...orderModal, open: false })}>
          <div className="cdm-subdialog" onClick={(e) => e.stopPropagation()}>
            <div className="cdm-subdialog-header">
              <h4 className="cdm-subdialog-title">{orderModal.index >= 0 ? "Sửa đơn hàng" : "Thêm đơn hàng mới"}</h4>
              <button className="cdm-close-btn" onClick={() => setOrderModal({ ...orderModal, open: false })}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveOrder}>
              <div className="cdm-subdialog-body">
                <div className="cdm-form-group">
                  <label>Mã đơn hàng</label>
                  <input
                    type="text"
                    required
                    value={orderModal.code}
                    onChange={(e) => setOrderModal({ ...orderModal, code: e.target.value })}
                    placeholder="VD: DH0001"
                  />
                </div>
                <div className="cdm-form-group">
                  <label>Ngày chốt</label>
                  <input
                    type="text"
                    required
                    value={orderModal.date}
                    onChange={(e) => setOrderModal({ ...orderModal, date: e.target.value })}
                    placeholder="VD: 11/1/2026"
                  />
                </div>
                <div className="cdm-form-group">
                  <label>Giá trị đơn hàng (VNĐ)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={orderModal.value}
                    onChange={(e) => setOrderModal({ ...orderModal, value: e.target.value })}
                    placeholder="VD: 500000"
                  />
                </div>
              </div>
              <div className="cdm-subdialog-actions">
                <button type="button" className="cdm-btn-cancel" onClick={() => setOrderModal({ ...orderModal, open: false })}>Hủy</button>
                <button type="submit" className="cdm-btn-submit">Lưu đơn hàng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal dialog: Thêm / Sửa Lịch Sử Chăm Sóc */}
      {careModal.open && (
        <div className="cdm-subdialog-overlay" onClick={() => setCareModal({ ...careModal, open: false })}>
          <div className="cdm-subdialog" onClick={(e) => e.stopPropagation()}>
            <div className="cdm-subdialog-header">
              <h4 className="cdm-subdialog-title">{careModal.index >= 0 ? "Sửa chăm sóc" : "Thêm lịch sử chăm sóc"}</h4>
              <button className="cdm-close-btn" onClick={() => setCareModal({ ...careModal, open: false })}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveCare}>
              <div className="cdm-subdialog-body">
                <div className="cdm-form-group">
                  <label>Ngày chăm sóc</label>
                  <input
                    type="text"
                    required
                    value={careModal.date}
                    onChange={(e) => setCareModal({ ...careModal, date: e.target.value })}
                    placeholder="VD: 11/1/2026"
                  />
                </div>
                <div className="cdm-form-group">
                  <label>Người thực hiện</label>
                  <input
                    type="text"
                    required
                    value={careModal.by}
                    onChange={(e) => setCareModal({ ...careModal, by: e.target.value })}
                    placeholder="VD: Administrator"
                  />
                </div>
                <div className="cdm-form-group">
                  <label>Nội dung chăm sóc</label>
                  <textarea
                    required
                    value={careModal.text}
                    onChange={(e) => setCareModal({ ...careModal, text: e.target.value })}
                    placeholder="Nhập ghi chú chăm sóc khách hàng..."
                  />
                </div>
                <div className="cdm-form-group">
                  <label>Ngày hẹn tiếp theo (Không bắt buộc)</label>
                  <input
                    type="text"
                    value={careModal.nextDate}
                    onChange={(e) => setCareModal({ ...careModal, nextDate: e.target.value })}
                    placeholder="VD: 18/1/2026"
                  />
                </div>
              </div>
              <div className="cdm-subdialog-actions">
                <button type="button" className="cdm-btn-cancel" onClick={() => setCareModal({ ...careModal, open: false })}>Hủy</button>
                <button type="submit" className="cdm-btn-submit">Lưu chăm sóc</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal dialog: Thêm / Sửa Cuộc Gọi */}
      {callModal.open && (
        <div className="cdm-subdialog-overlay" onClick={() => setCallModal({ ...callModal, open: false })}>
          <div className="cdm-subdialog" onClick={(e) => e.stopPropagation()}>
            <div className="cdm-subdialog-header">
              <h4 className="cdm-subdialog-title">{callModal.index >= 0 ? "Sửa thông tin cuộc gọi" : "Thêm nhật ký cuộc gọi"}</h4>
              <button className="cdm-close-btn" onClick={() => setCallModal({ ...callModal, open: false })}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveCall}>
              <div className="cdm-subdialog-body">
                <div className="cdm-form-group">
                  <label>Ngày gọi</label>
                  <input
                    type="text"
                    required
                    value={callModal.date}
                    onChange={(e) => setCallModal({ ...callModal, date: e.target.value })}
                    placeholder="VD: 11/1/2026"
                  />
                </div>
                <div className="cdm-form-group">
                  <label>Số cuộc gọi</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={callModal.count}
                    onChange={(e) => setCallModal({ ...callModal, count: e.target.value })}
                  />
                </div>
                <label className="cdm-checkbox-group">
                  <input
                    type="checkbox"
                    checked={callModal.isToday}
                    onChange={(e) => setCallModal({ ...callModal, isToday: e.target.checked })}
                  />
                  Đánh dấu là cuộc gọi Hôm nay
                </label>
              </div>
              <div className="cdm-subdialog-actions">
                <button type="button" className="cdm-btn-cancel" onClick={() => setCallModal({ ...callModal, open: false })}>Hủy</button>
                <button type="submit" className="cdm-btn-submit">Lưu cuộc gọi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
