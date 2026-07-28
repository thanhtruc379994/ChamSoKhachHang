import React, { useEffect, useMemo, useState } from "react";
import {
  RefreshCw, Plus, Pencil, Wallet, Trash2, PhoneCall, ChevronDown,
  ChevronLeft, ChevronRight, Search, Ban, List
} from "lucide-react";
import CrmHeader from "../../components/header/CrmHeader";
import CustomerDetailModal from "./CustomerDetailModal";
import CustomerFormModal from "./CustomerFormModal";
import { useIndexedDbState } from "../../data/indexedDb";
import { DEFAULT_EMPLOYEES, DEFAULT_SOURCES, DEFAULT_STATUSES, getStatusColor } from "../../data/crmOptions";
import "./CrmCustomerList.css";

export const CUSTOMERS = [
  { id: 14, date: "14/1/2026", name: "Chị Hoài", call: null, phone: "xxx", source: "Kiot", area: "Đà Lạt", status: "Đang thuyết phục", staff: "Nhân viên 2", note: "chăm nguyên tonie...", revenue: null, revenueBadge: null, lastContact: "---", nextDate: "---", createdDate: "14/1/2026", address: "", orders: [], careHistory: [], calls: [] },
  { id: 13, date: "13/1/2026", name: "Anh Hoàng", call: null, badge: 1, phone: "xxx", source: "Kiot", area: "Đà Lạt", status: "Đã gửi báo giá", staff: "Nhân viên 2", note: "chăm nguyên tonie...", revenue: null, revenueBadge: null, lastContact: "9/1/2026", nextDate: "12/1/...", createdDate: "13/1/2026", address: "", orders: [], careHistory: [], calls: [] },
  { id: 12, date: "12/1/2026", name: "Anh Mạnh", call: null, badge: 2, phone: "xxx", source: "Kiot", area: "Đà Lạt", status: "Đang thuyết phục", staff: "Nhân viên 1", note: "chăm nguyên tonie...", revenue: null, revenueBadge: null, lastContact: "---", nextDate: "---", createdDate: "12/1/2026", address: "", orders: [], careHistory: [], calls: [] },
  {
    id: 11, date: "7/1/2026", name: "Anh Hải", call: 3, phone: "xxx", source: "Website", area: "Thanh Hoá",
    status: "Đã chốt", staff: "Nhân viên 1", note: "GHTN PR", revenue: "580.000", revenueBadge: 1,
    lastContact: "11/1/2026", nextDate: "18/1/...", createdDate: "7/1/2026",
    address: "120 Nguyễn Thị Định - Prang - Tháp Chàm",
    orders: [
      { code: "DH0003", date: "11/1/2026", value: 500000 },
      { code: "DH0002", date: "8/1/2026", value: 30000 },
      { code: "DH0001", date: "7/1/2026", value: 50000 },
    ],
    careHistory: [
      { date: "11/1/2026", by: "Administrator", text: "Hôm nay gọi 3 lần mà chưa nghe máy", nextDate: "18/1/2026" },
      { date: "9/1/2026", by: "Administrator", text: "Chăm sóc lần 1", nextDate: "16/1/2026" },
    ],
    calls: [
      { date: "11/1/2026", count: 3, isToday: true },
      { date: "9/1/2026", count: 1, isToday: false },
    ],
  },
  { id: 10, date: "11/1/2026", name: "Anh Lâm", call: null, phone: "xxx", source: "Kiot", area: "Thanh Hoá", status: "Đã gửi thông tin", staff: "Nhân viên 1", note: "chăm nguyên tonie...", revenue: null, revenueBadge: null, lastContact: "---", nextDate: "---", createdDate: "11/1/2026", address: "", orders: [], careHistory: [], calls: [] },
  { id: 9, date: "10/1/2026", name: "Chị Thảm", call: null, phone: "xxx", source: "Kiot", area: "Thanh Hoá", status: "Đã chốt", staff: "Administrator", note: "chăm nguyên tonie...", revenue: "1.200.000", revenueBadge: 2, lastContact: "---", nextDate: "---", createdDate: "10/1/2026", address: "", orders: [{ code: "DH0004", date: "10/1/2026", value: 1200000 }], careHistory: [], calls: [] },
  { id: 8, date: "9/1/2026", name: "Chị Hằng", call: 1, badge: 3, phone: "xxx", source: "Kiot", area: "Đà Nẵng", status: "Đã gửi thông tin", staff: "Administrator", note: "chăm nguyên tonie...", revenue: null, revenueBadge: null, lastContact: "---", nextDate: "---", createdDate: "9/1/2026", address: "", orders: [], careHistory: [], calls: [{ date: "9/1/2026", count: 1, isToday: false }] },
  { id: 7, date: "9/1/2026", name: "Anh Minh", call: 1, phone: "xxx", source: "Giới thiệu", area: "Hà Nội", status: "Đã chốt", staff: "Administrator", note: "Gọi khách trước khi ...", revenue: "200.000", revenueBadge: null, lastContact: "11/1/2026", nextDate: "18/1/...", createdDate: "9/1/2026", address: "", orders: [{ code: "DH0005", date: "11/1/2026", value: 200000 }], careHistory: [], calls: [{ date: "9/1/2026", count: 1, isToday: false }] },
  { id: 6, date: "9/1/2026", name: "Anh Hoài", call: null, phone: "xxx", source: "Website", area: "Thanh Hoá", status: "Đã gửi thông tin", staff: "Administrator", note: "---", revenue: "---", revenueBadge: null, lastContact: "---", nextDate: "---", createdDate: "9/1/2026", address: "", orders: [], careHistory: [], calls: [] },
  { id: 5, date: "9/1/2026", name: "Chị Trang", call: null, phone: "xxx", source: "Facebook", area: "Đà Lạt", status: "Khách hàng mới", staff: "Administrator", note: "BẮP GIÓ LITERAL/BA...", revenue: "---", revenueBadge: null, lastContact: "---", nextDate: "---", createdDate: "9/1/2026", address: "", orders: [], careHistory: [], calls: [] },
];

function StatusDropdown({ status, statuses, onChange }) {
  const color = getStatusColor(statuses, status);
  return (
    <div className="crm-status-select-wrap" style={{ backgroundColor: `${color}18`, color }}>
      <select
        className="crm-status-select"
        value={status}
        onChange={(e) => onChange(e.target.value)}
      >
        {statuses.map((option) => (
          <option key={option.id} value={option.name}>{option.name}</option>
        ))}
      </select>
      <ChevronDown size={13} className="crm-status-select-icon" />
    </div>
  );
}

function CountPill({ n, variant }) {
  if (!n) return null;
  return <span className={`crm-count-pill ${variant || ""}`}>{n}</span>;
}

export default function CrmCustomerList({ onNavigate, onChangePassword, onLogout }) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeNav, setActiveNav] = useState("customers");
  const [search, setSearch] = useState("");
  const [customers, setCustomers, customersReady] = useIndexedDbState("customers", CUSTOMERS);
  const [statuses, , statusesReady] = useIndexedDbState("statuses", DEFAULT_STATUSES);
  const [employees, , employeesReady] = useIndexedDbState("employees", DEFAULT_EMPLOYEES);
  const [sources, , sourcesReady] = useIndexedDbState("sources", DEFAULT_SOURCES);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(undefined);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [staffFilter, setStaffFilter] = useState("all");
  const [areaFilter, setAreaFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!customersReady || !statusesReady || !employeesReady || !sourcesReady) return;
    const mappings = {
      status: new Map(DEFAULT_STATUSES.map((item) => [item.name, statuses.find((current) => current.id === item.id)?.name])),
      staff: new Map(DEFAULT_EMPLOYEES.map((item) => [item.name, employees.find((current) => current.id === item.id)?.name])),
      source: new Map(DEFAULT_SOURCES.map((item) => [item.name, sources.find((current) => current.id === item.id)?.name])),
    };
    setCustomers((list) => {
      let changed = false;
      const next = list.map((customer) => {
        const updates = {};
        Object.entries(mappings).forEach(([field, mapping]) => {
          const mappedValue = mapping.get(customer[field]);
          if (mappedValue && mappedValue !== customer[field]) updates[field] = mappedValue;
        });
        if (Object.keys(updates).length === 0) return customer;
        changed = true;
        return { ...customer, ...updates };
      });
      return changed ? next : list;
    });
  }, [customersReady, employees, employeesReady, setCustomers, sources, sourcesReady, statuses, statusesReady]);

  const filteredCustomers = useMemo(() => customers.filter((customer) => {
    const keyword = search.trim().toLowerCase();
    const matchesSearch = !keyword || [customer.name, customer.phone, customer.source, customer.area, customer.note]
      .some((value) => String(value || "").toLowerCase().includes(keyword));
    return matchesSearch
      && (activeTab === "all" || customer.status === activeTab)
      && (staffFilter === "all" || customer.staff === staffFilter)
      && (areaFilter === "all" || customer.area === areaFilter);
  }), [activeTab, areaFilter, customers, search, staffFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visibleCustomers = filteredCustomers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const statusTabs = [
    { key: "all", label: "Tất cả", count: customers.length, icon: List, colorClass: "tab-all" },
    ...statuses.map((status) => ({
      key: status.name,
      label: status.name,
      color: status.color,
      count: customers.filter((customer) => customer.status === status.name).length,
    })),
  ];

  const saveCustomer = (values) => {
    if (values.id) {
      setCustomers((list) => list.map((item) => item.id === values.id ? values : item));
    } else {
      const now = new Date();
      const date = now.toLocaleDateString("vi-VN");
      setCustomers((list) => [{
        ...values, id: Math.max(0, ...list.map((item) => Number(item.id))) + 1,
        date, createdDate: date, call: null, badge: null, revenueBadge: null,
        lastContact: "---", nextDate: "---", orders: [], careHistory: [], calls: [],
      }, ...list]);
    }
    setEditingCustomer(undefined);
  };

  const confirmDelete = () => {
    setCustomers((list) => list.filter((item) => item.id !== deleteCustomer.id));
    setDeleteCustomer(null);
  };

  const handleStatusChange = (id, newStatus) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleNavChange = (navKey) => {
    setActiveNav(navKey);
    onNavigate?.(navKey);
  };

  return (
    <div className="crm">
      <CrmHeader
        title="Quản lý chăm sóc khách hàng"
        activeNav={activeNav}
        onNavChange={handleNavChange}
        onChangePassword={onChangePassword}
        onLogout={onLogout}
      />

      <div className="crm-container">

        {/* Main card */}
        <div className="crm-card">

          {/* Status tabs */}
          <div className="crm-status-tabs">
            {statusTabs.map((tab, idx) => {
              const active = activeTab === tab.key;
              const Icon = tab.icon;
              const isFirst = idx === 0;
              const isLast = idx === statusTabs.length - 1;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`crm-status-tab ${tab.colorClass || ""} ${active ? "active" : ""} ${isFirst ? "first" : ""} ${isLast ? "last" : ""}`}
                  style={!active && tab.color ? { backgroundColor: `${tab.color}18`, color: tab.color } : undefined}
                >
                  {Icon && <Icon size={15} className="crm-tab-icon" />}
                  <span>{tab.label}</span>
                  <span className="crm-tab-count">{tab.count}</span>
                </button>
              );
            })}
          </div>

          {/* Filter bar */}
          <div className="crm-filter-bar">
            <div className="crm-filter-controls">
              <button className="crm-filter-btn">
                <Ban size={14} /> Ẩn cột
              </button>
              <div className="crm-search-wrap">
                <Search size={15} className="crm-search-icon" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Tìm kiếm từ khoá..."
                  className="crm-search-input"
                />
              </div>
              <select className="crm-filter-select" value={staffFilter} onChange={(e) => { setStaffFilter(e.target.value); setPage(1); }}>
              <option value="all">Tất cả nhân viên</option>
              {employees.map(employee => <option key={employee.id} value={employee.name}>{employee.name}</option>)}
              </select>
              <select className="crm-filter-select" value={areaFilter} onChange={(e) => { setAreaFilter(e.target.value); setPage(1); }}>
                <option value="all">Tất cả khu vực</option>
                {[...new Set(customers.map((c) => c.area))].map(x => <option key={x}>{x}</option>)}
              </select>
              <button className="crm-refresh-btn" title="Đặt lại bộ lọc" onClick={() => { setSearch(""); setStaffFilter("all"); setAreaFilter("all"); setActiveTab("all"); setPage(1); }}>
                <RefreshCw size={15} />
              </button>
              <div className="crm-care-wrap">
                <label className="crm-checkbox-label">
                  <input type="checkbox" />
                  Cần chăm
                </label>
                <input defaultValue={2} className="crm-days-input" />
                <span className="crm-days-text">ngày tới</span>
              </div>
            </div>
            <button className="crm-add-btn" onClick={() => setEditingCustomer(null)}>
              <Plus size={15} /> Thêm
            </button>
          </div>

          {/* Table */}
          <div className="crm-table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  {["ID", "Ngày tạo", "Tên", "Điện thoại", "Nguồn", "Khu vực", "Trạng thái", "Phụ trách", "Ghi chú", "Doanh thu", "Liên hệ gần nhất", "Ngày", "Thao tác"].map((h) => (
                    <th key={h}>
                      <span className="crm-th-label">{h} <ChevronDown size={11} style={{ opacity: 0.4 }} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((c) => (
                  <tr key={c.id}>
                    <td className="crm-id-cell">
                      {c.id}
                      {c.call ? (
                        <span className="crm-call-tag">
                          <PhoneCall size={9} /> {c.call}
                        </span>
                      ) : null}
                    </td>
                    <td className="crm-cell-nowrap crm-cell-muted">{c.date}</td>
                    <td>
                      <button
                        type="button"
                        className="crm-name-link crm-name-btn"
                        onClick={() => setSelectedCustomer(c.id)}
                      >
                        {c.name}
                      </button>
                      <CountPill n={c.badge} />
                    </td>
                    <td className="crm-cell-muted">{c.phone}</td>
                    <td className="crm-cell-text">{c.source}</td>
                    <td className="crm-cell-nowrap crm-cell-text">{c.area}</td>
                    <td><StatusDropdown status={c.status} statuses={statuses} onChange={(val) => handleStatusChange(c.id, val)} /></td>
                    <td className="crm-cell-nowrap crm-cell-text">{c.staff}</td>
                    <td className="crm-cell-nowrap crm-cell-truncate crm-cell-muted">{c.note}</td>
                    <td className="crm-cell-nowrap">
                      {c.revenue}
                      <CountPill n={c.revenueBadge} variant="orange" />
                    </td>
                    <td className="crm-cell-nowrap crm-cell-muted">{c.lastContact}</td>
                    <td className="crm-cell-nowrap crm-cell-muted">{c.nextDate}</td>
                    <td>
                      <div className="crm-actions">
                        <button title="Sửa khách hàng" className="crm-action-btn edit" onClick={() => setEditingCustomer(c)}><Pencil size={13} /></button>
                        <button title="Xem chi tiết" className="crm-action-btn money" onClick={() => setSelectedCustomer(c.id)}><Wallet size={13} /></button>
                        <button title="Xóa khách hàng" className="crm-action-btn delete" onClick={() => setDeleteCustomer(c)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="crm-footer">
            <span>Hiển thị {filteredCustomers.length ? (safePage - 1) * pageSize + 1 : 0}-{Math.min(safePage * pageSize, filteredCustomers.length)} trong tổng {filteredCustomers.length} khách hàng</span>
            <div className="crm-footer-right">
              <span className="crm-page-size">
                Số dòng/trang:
                <select className="crm-page-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </span>
              <button className="crm-page-btn" disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={14} /> Trước
              </button>
              <span>Trang {safePage} / {totalPages}</span>
              <button className="crm-page-btn" disabled={safePage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedCustomer !== null && (
        <CustomerDetailModal
          customer={customers.find((c) => c.id === selectedCustomer)}
          statuses={statuses}
          onClose={() => setSelectedCustomer(null)}
          onStatusChange={handleStatusChange}
          onUpdateCustomer={(updated) => {
            setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
          }}
        />
      )}
      {editingCustomer !== undefined && (
        <CustomerFormModal customer={editingCustomer} statuses={statuses} employees={employees} sources={sources} onClose={() => setEditingCustomer(undefined)} onSave={saveCustomer} />
      )}
      {deleteCustomer && (
        <div className="crm-dialog-overlay" onMouseDown={() => setDeleteCustomer(null)}>
          <div className="crm-confirm-dialog" onMouseDown={(e) => e.stopPropagation()}>
            <div className="crm-confirm-icon"><Trash2 size={22} /></div>
            <h3>Xóa khách hàng?</h3>
            <p>Bạn có chắc muốn xóa <b>{deleteCustomer.name}</b>? Dữ liệu liên quan cũng sẽ bị xóa.</p>
            <div className="crm-dialog-actions"><button className="cancel" onClick={() => setDeleteCustomer(null)}>Hủy</button><button className="danger" onClick={confirmDelete}>Xóa</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
