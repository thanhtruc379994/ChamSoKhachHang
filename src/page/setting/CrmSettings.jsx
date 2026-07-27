import { useState } from 'react';
import CrmHeader from '../../components/header/CrmHeader';
import { updateData, useIndexedDbState, writeData } from '../../data/indexedDb';
import { DEFAULT_EMPLOYEES, DEFAULT_SOURCES, DEFAULT_STATUSES } from '../../data/crmOptions';
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

export default function CrmSettings({ onNavigate, onChangePassword, onLogout }) {
  const [employees, setEmployees] = useIndexedDbState('employees', DEFAULT_EMPLOYEES);
  const [statuses, setStatuses] = useIndexedDbState('statuses', DEFAULT_STATUSES);
  const [sources, setSources] = useIndexedDbState('sources', DEFAULT_SOURCES);

  const [employeeModal, setEmployeeModal] = useState(null); // null | {} (add) | employee (edit)
  const [statusModal, setStatusModal] = useState(null);
  const [sourceModal, setSourceModal] = useState(null);

  // ---------- Employees ----------
  const openAddEmployee = () =>
    setEmployeeModal({ name: '', role: 'Nhân viên', manager: '', username: '', password: '' });
  const openEditEmployee = (emp) => setEmployeeModal({ ...emp });
  const saveEmployee = async () => {
    if (!employeeModal.name || !employeeModal.username) return;
    if (employeeModal.id) {
      const previous = employees.find((employee) => employee.id === employeeModal.id);
      const defaultName = DEFAULT_EMPLOYEES.find((employee) => employee.id === employeeModal.id)?.name;
      const oldNames = [...new Set([
        ...(previous?.aliases || []),
        previous?.name,
        defaultName,
      ].filter((name) => name && name !== employeeModal.name))];
      const savedEmployee = oldNames.length
        ? { ...employeeModal, aliases: oldNames }
        : employeeModal;
      const nextEmployees = employees.map((employee) => {
        if (employee.id === employeeModal.id) return savedEmployee;
        if (previous && employee.manager === previous.name) {
          return { ...employee, manager: employeeModal.name };
        }
        return employee;
      });
      if (oldNames.length) {
        await Promise.all([
          writeData('employees', nextEmployees),
          ...oldNames.flatMap((oldName) => [
            replaceCustomerField('staff', oldName, employeeModal.name),
            replaceTaskEmployee(oldName, employeeModal.name),
          ]),
        ]);
      } else {
        await writeData('employees', nextEmployees);
      }
    } else {
      await writeData('employees', [...employees, { ...employeeModal, id: Date.now() }]);
    }
    setEmployeeModal(null);
  };
  const deleteEmployee = (id) => {
    const deleted = employees.find((employee) => employee.id === id);
    const fallback = employees.find((employee) => employee.id !== id)?.name || DEFAULT_EMPLOYEES[0].name;
    setEmployees((list) => list.filter((e) => e.id !== id));
    if (deleted) {
      replaceCustomerField('staff', deleted.name, fallback).catch(console.error);
      replaceTaskEmployee(deleted.name, fallback).catch(console.error);
    }
  };

  // ---------- Statuses ----------
  const openAddStatus = () => setStatusModal({ name: '', color: STATUS_COLORS[0], system: false });
  const openEditStatus = (st) => setStatusModal({ ...st });
  const replaceCustomerField = async (field, oldName, newName) => {
    await updateData('customers', (customers) =>
      Array.isArray(customers)
        ? customers.map((customer) =>
            customer[field] === oldName ? { ...customer, [field]: newName } : customer
          )
        : customers
    );
  };
  const replaceTaskEmployee = async (oldName, newName) => {
    await updateData('tasks', (tasks) =>
      Array.isArray(tasks)
        ? tasks.map((task) => ({
            ...task,
            from: task.from === oldName ? newName : task.from,
            to: task.to?.split(',').map((name) => name.trim() === oldName ? newName : name.trim()).join(', '),
          }))
        : tasks
    );
  };
  const saveStatus = async () => {
    if (!statusModal.name) return;
    if (statusModal.id) {
      const previous = statuses.find((status) => status.id === statusModal.id);
      const nextStatuses = statuses.map((status) => status.id === statusModal.id ? statusModal : status);
      if (previous && previous.name !== statusModal.name) {
        await Promise.all([
          writeData('statuses', nextStatuses),
          replaceCustomerField('status', previous.name, statusModal.name),
        ]);
      } else {
        await writeData('statuses', nextStatuses);
      }
    } else {
      await writeData('statuses', [...statuses, { ...statusModal, id: Date.now() }]);
    }
    setStatusModal(null);
  };
  const deleteStatus = (id) => {
    const deleted = statuses.find((status) => status.id === id);
    const fallback = statuses.find((status) => status.id !== id)?.name || DEFAULT_STATUSES[0].name;
    setStatuses((list) => list.filter((s) => s.id !== id));
    if (deleted) replaceCustomerField('status', deleted.name, fallback).catch(console.error);
  };
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
  const saveSource = async () => {
    if (!sourceModal.name) return;
    if (sourceModal.id) {
      const previous = sources.find((source) => source.id === sourceModal.id);
      const nextSources = sources.map((source) => source.id === sourceModal.id ? sourceModal : source);
      if (previous && previous.name !== sourceModal.name) {
        await Promise.all([
          writeData('sources', nextSources),
          replaceCustomerField('source', previous.name, sourceModal.name),
        ]);
      } else {
        await writeData('sources', nextSources);
      }
    } else {
      await writeData('sources', [...sources, { ...sourceModal, id: Date.now() }]);
    }
    setSourceModal(null);
  };
  const deleteSource = (id) => {
    const deleted = sources.find((source) => source.id === id);
    const fallback = sources.find((source) => source.id !== id)?.name || DEFAULT_SOURCES[0].name;
    setSources((list) => list.filter((s) => s.id !== id));
    if (deleted) replaceCustomerField('source', deleted.name, fallback).catch(console.error);
  };

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
