import { useState } from 'react';
import CrmHeader from '../../components/header/CrmHeader';
import { useIndexedDbState } from '../../data/indexedDb';
import './CrmSettings.css';

const IconUsers = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconStatus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);
const IconSource = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8a3 3 0 1 0-2.83-4H8.83A3 3 0 1 0 6 8c.35 0 .69-.06 1-.17v8.34c-.31-.11-.65-.17-1-.17a3 3 0 1 0 2.83 4h6.34A3 3 0 1 0 18 16c-.35 0-.69.06-1 .17V7.83c.31.11.65.17 1 .17Z" />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);
const IconUp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M18 15l-6-6-6 6" />
  </svg>
);
const IconDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

const STATUS_COLORS = ['#2563eb', '#ec4899', '#6366f1', '#06b6d4', '#22c55e', '#ef4444', '#f59e0b', '#64748b'];

const initialEmployees = [
  { id: 1, name: 'Administrator', role: 'Admin', manager: null, username: 'admin', password: '' },
  { id: 2, name: 'Nhân viên 1', role: 'Nhân viên', manager: null, username: 'nv1', password: 'a123' },
  { id: 3, name: 'Nhân viên 2', role: 'Nhân viên', manager: 'Nhân viên 1', username: 'nv2', password: 'a123' },
  { id: 4, name: 'Nhân viên 3', role: 'Nhân viên', manager: 'Nhân viên 2', username: 'nv3', password: 'a124' },
];

const initialStatuses = [
  { id: 1, name: 'Khách hàng mới', color: '#2563eb', system: true },
  { id: 2, name: 'Đã gửi thông tin', color: '#ec4899', system: false },
  { id: 3, name: 'Đang thuyết phục', color: '#6366f1', system: false },
  { id: 4, name: 'Đã gửi báo giá', color: '#06b6d4', system: false },
  { id: 5, name: 'Đã chốt', color: '#22c55e', system: true },
  { id: 6, name: 'Không quan tâm', color: '#ef4444', system: false },
];

const initialSources = [
  { id: 1, name: 'Facebook', desc: 'Khách hàng từ quảng cáo Facebook' },
  { id: 2, name: 'Website', desc: 'Khách hàng đăng ký từ website' },
  { id: 3, name: 'Giới thiệu', desc: 'Khách hàng được giới thiệu' },
];

export default function CrmSettings({ onNavigate, onChangePassword, onLogout }) {
  const [employees, setEmployees] = useIndexedDbState('employees', initialEmployees);
  const [statuses, setStatuses] = useIndexedDbState('statuses', initialStatuses);
  const [sources, setSources] = useIndexedDbState('sources', initialSources);

  const [employeeModal, setEmployeeModal] = useState(null); // null | {} (add) | employee (edit)
  const [statusModal, setStatusModal] = useState(null);
  const [sourceModal, setSourceModal] = useState(null);

  // ---------- Employees ----------
  const openAddEmployee = () =>
    setEmployeeModal({ name: '', role: 'Nhân viên', manager: '', username: '', password: '' });
  const openEditEmployee = (emp) => setEmployeeModal({ ...emp });
  const saveEmployee = () => {
    if (!employeeModal.name || !employeeModal.username) return;
    if (employeeModal.id) {
      setEmployees((list) => list.map((e) => (e.id === employeeModal.id ? employeeModal : e)));
    } else {
      setEmployees((list) => [...list, { ...employeeModal, id: Date.now() }]);
    }
    setEmployeeModal(null);
  };
  const deleteEmployee = (id) => setEmployees((list) => list.filter((e) => e.id !== id));

  // ---------- Statuses ----------
  const openAddStatus = () => setStatusModal({ name: '', color: STATUS_COLORS[0], system: false });
  const openEditStatus = (st) => setStatusModal({ ...st });
  const saveStatus = () => {
    if (!statusModal.name) return;
    if (statusModal.id) {
      setStatuses((list) => list.map((s) => (s.id === statusModal.id ? statusModal : s)));
    } else {
      setStatuses((list) => [...list, { ...statusModal, id: Date.now() }]);
    }
    setStatusModal(null);
  };
  const deleteStatus = (id) => setStatuses((list) => list.filter((s) => s.id !== id));
  const moveStatus = (index, dir) => {
    setStatuses((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      if (next[index].system || next[target].system) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  // ---------- Sources ----------
  const openAddSource = () => setSourceModal({ name: '', desc: '' });
  const openEditSource = (src) => setSourceModal({ ...src });
  const saveSource = () => {
    if (!sourceModal.name) return;
    if (sourceModal.id) {
      setSources((list) => list.map((s) => (s.id === sourceModal.id ? sourceModal : s)));
    } else {
      setSources((list) => [...list, { ...sourceModal, id: Date.now() }]);
    }
    setSourceModal(null);
  };
  const deleteSource = (id) => setSources((list) => list.filter((s) => s.id !== id));

  return (
    <>
      <CrmHeader activeNav="settings" onNavChange={onNavigate} onChangePassword={onChangePassword} onLogout={onLogout} />

      <div className="crm-settings-page">
        <div className="crm-settings-grid">
          {/* ---------------- Quản lý nhân viên ---------------- */}
          <div className="crm-settings-card">
            <h3 className="crm-settings-card-title">
              <IconUsers /> Quản lý nhân viên
            </h3>
            <div className="crm-settings-list">
              {employees.map((emp) => (
                <div className="crm-settings-row" key={emp.id}>
                  <div className="crm-settings-row-main">
                    <span className="crm-settings-row-label employee-name">
                      {emp.name} - {emp.role}
                    </span>
                    {emp.manager && <span className="crm-settings-row-sub">(QL: {emp.manager})</span>}
                  </div>
                  <div className="crm-settings-row-actions">
                    <button className="crm-icon-btn edit" onClick={() => openEditEmployee(emp)}>
                      <IconEdit />
                    </button>
                    <button className="crm-icon-btn delete" onClick={() => deleteEmployee(emp.id)}>
                      <IconTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="crm-add-btn" onClick={openAddEmployee}>
              <IconPlus /> Thêm nhân viên
            </button>
          </div>

          {/* ---------------- Quản lý trạng thái ---------------- */}
          <div className="crm-settings-card">
            <h3 className="crm-settings-card-title">
              <IconStatus /> Quản lý trạng thái
            </h3>
            <div className="crm-settings-list">
              {statuses.map((st, index) => (
                <div className="crm-settings-row" key={st.id}>
                  <div className="crm-settings-row-main">
                    <span className="crm-status-dot" style={{ background: st.color }} />
                    <span className="crm-settings-row-label" style={{ color: st.color }}>
                      {st.name}
                    </span>
                  </div>
                  {st.system ? (
                    <span className="crm-settings-row-system">Trạng thái hệ thống</span>
                  ) : (
                    <div className="crm-settings-row-actions">
                      <button
                        className="crm-icon-btn"
                        disabled={index === 0 || statuses[index - 1].system}
                        onClick={() => moveStatus(index, -1)}
                      >
                        <IconUp />
                      </button>
                      <button
                        className="crm-icon-btn"
                        disabled={index === statuses.length - 1 || statuses[index + 1].system}
                        onClick={() => moveStatus(index, 1)}
                      >
                        <IconDown />
                      </button>
                      <button className="crm-icon-btn edit" onClick={() => openEditStatus(st)}>
                        <IconEdit />
                      </button>
                      <button className="crm-icon-btn delete" onClick={() => deleteStatus(st.id)}>
                        <IconTrash />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button className="crm-add-btn" onClick={openAddStatus}>
              <IconPlus /> Thêm trạng thái
            </button>
          </div>

          {/* ---------------- Quản lý nguồn khách ---------------- */}
          <div className="crm-settings-card">
            <h3 className="crm-settings-card-title">
              <IconSource /> Quản lý nguồn khách
            </h3>
            <div className="crm-settings-list">
              {sources.map((src) => (
                <div className="crm-settings-row" key={src.id}>
                  <div className="crm-settings-row-main">
                    <span className="crm-settings-row-label employee-name">{src.name}</span>
                    <span className="crm-settings-row-desc">- {src.desc}</span>
                  </div>
                  <div className="crm-settings-row-actions">
                    <button className="crm-icon-btn edit" onClick={() => openEditSource(src)}>
                      <IconEdit />
                    </button>
                    <button className="crm-icon-btn delete" onClick={() => deleteSource(src.id)}>
                      <IconTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="crm-add-btn" onClick={openAddSource}>
              <IconPlus /> Thêm nguồn khách
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Modal: Thêm / Sửa nhân viên ---------------- */}
      {employeeModal && (
        <div className="crm-modal-overlay" onClick={() => setEmployeeModal(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>{employeeModal.id ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}</h3>
              <button className="crm-modal-close" onClick={() => setEmployeeModal(null)}>
                ×
              </button>
            </div>

            <div className="crm-form-group">
              <label>Tên nhân viên *</label>
              <input
                type="text"
                value={employeeModal.name}
                onChange={(e) => setEmployeeModal({ ...employeeModal, name: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label>Chức vụ *</label>
              <select
                value={employeeModal.role}
                onChange={(e) => setEmployeeModal({ ...employeeModal, role: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="Nhân viên">Nhân viên</option>
              </select>
            </div>

            <div className="crm-form-group">
              <label>Tên đăng nhập *</label>
              <input
                type="text"
                value={employeeModal.username}
                onChange={(e) => setEmployeeModal({ ...employeeModal, username: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label>Mật khẩu *</label>
              <input
                type="text"
                value={employeeModal.password}
                onChange={(e) => setEmployeeModal({ ...employeeModal, password: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label>Người quản lý</label>
              <select
                value={employeeModal.manager || ''}
                onChange={(e) => setEmployeeModal({ ...employeeModal, manager: e.target.value })}
              >
                <option value="">-- Không --</option>
                {employees
                  .filter((e) => e.id !== employeeModal.id)
                  .map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="crm-modal-actions">
              <button className="crm-btn-cancel" onClick={() => setEmployeeModal(null)}>
                Hủy
              </button>
              <button className="crm-btn-save" onClick={saveEmployee}>
                <IconSave /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Modal: Thêm / Sửa trạng thái ---------------- */}
      {statusModal && (
        <div className="crm-modal-overlay" onClick={() => setStatusModal(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>{statusModal.id ? 'Sửa trạng thái' : 'Thêm trạng thái mới'}</h3>
              <button className="crm-modal-close" onClick={() => setStatusModal(null)}>
                ×
              </button>
            </div>

            <div className="crm-form-group">
              <label>Tên trạng thái *</label>
              <input
                type="text"
                value={statusModal.name}
                onChange={(e) => setStatusModal({ ...statusModal, name: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label>Màu sắc</label>
              <div className="crm-color-swatches">
                {STATUS_COLORS.map((c) => (
                  <div
                    key={c}
                    className={`crm-color-swatch${statusModal.color === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setStatusModal({ ...statusModal, color: c })}
                  />
                ))}
              </div>
            </div>

            <div className="crm-modal-actions">
              <button className="crm-btn-cancel" onClick={() => setStatusModal(null)}>
                Hủy
              </button>
              <button className="crm-btn-save" onClick={saveStatus}>
                <IconSave /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Modal: Thêm / Sửa nguồn khách ---------------- */}
      {sourceModal && (
        <div className="crm-modal-overlay" onClick={() => setSourceModal(null)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>{sourceModal.id ? 'Sửa nguồn khách' : 'Thêm nguồn khách'}</h3>
              <button className="crm-modal-close" onClick={() => setSourceModal(null)}>
                ×
              </button>
            </div>

            <div className="crm-form-group">
              <label>Tên nguồn khách *</label>
              <input
                type="text"
                value={sourceModal.name}
                onChange={(e) => setSourceModal({ ...sourceModal, name: e.target.value })}
              />
            </div>

            <div className="crm-form-group">
              <label>Mô tả</label>
              <input
                type="text"
                value={sourceModal.desc}
                onChange={(e) => setSourceModal({ ...sourceModal, desc: e.target.value })}
              />
            </div>

            <div className="crm-modal-actions">
              <button className="crm-btn-cancel" onClick={() => setSourceModal(null)}>
                Hủy
              </button>
              <button className="crm-btn-save" onClick={saveSource}>
                <IconSave /> Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
