import { useMemo, useState } from 'react';
import CrmHeader from '../../components/header/CrmHeader';
import { useIndexedDbState } from '../../data/indexedDb';
import { DEFAULT_EMPLOYEES } from '../../data/crmOptions';
import './CrmTasks.css';

const PAGE_SIZE = 16;

const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 11h-2V7h2Zm0 4h-2v-2h2Z" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);
const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M9 18l6-6-6-6" />
  </svg>
);
const IconHelp = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2-3 4" />
    <path d="M12 17h.01" />
  </svg>
);

const initialTasks = [
  { id: 1, due: '08/12/2025', priority: 'urgent', content: 'Gửi báo giá máy lọc nước cho anh Tuấn', from: 'Administrator', to: 'Nhân viên 1', done: false },
  { id: 2, due: '08/12/2025', priority: 'urgent', content: 'Nộp báo cáo doanh số tháng 5', from: 'Administrator', to: 'Tất cả', done: false },
  { id: 3, due: '08/12/2025', priority: 'urgent', content: 'Xử lý khiếu nại đơn hàng #DH8821', from: 'Administrator', to: 'Nhân viên 2', done: false },
  { id: 4, due: '08/12/2025', priority: 'urgent', content: 'Backup dữ liệu khách hàng lên Drive', from: 'Administrator', to: 'Administrator', done: false },
  { id: 5, due: '08/12/2025', priority: 'urgent', content: 'Gọi nhắc gia hạn hợp đồng công ty ABC', from: 'Administrator', to: 'Nhân viên 1, Nhân viên 2', done: false },
  { id: 6, due: '08/12/2025', priority: 'urgent', content: 'Tìm kiếm 50 khách hàng tiềm năng mới', from: 'Administrator', to: 'Nhân viên 2', done: false },
  { id: 7, due: '08/12/2025', priority: 'urgent', content: 'Sửa lỗi kết nối máy in phòng kế toán', from: 'Administrator', to: 'Administrator', done: false },
  { id: 8, due: '08/12/2025', priority: 'urgent', content: 'Gọi điện xác nhận lịch hẹn anh Hùng 14h', from: 'Administrator', to: 'Nhân viên 1, Nhân viên 2', done: false },
  { id: 9, due: '08/12/2025', priority: 'urgent', content: 'Gửi quà tri ân khách hàng VIP', from: 'Administrator', to: 'Tất cả', done: false },
  { id: 10, due: '08/12/2025', priority: 'urgent', content: 'Xin chào ngày mới', from: 'Nhân viên 2', to: 'Tất cả', done: false },
  { id: 11, due: '08/12/2025', priority: 'normal', content: 'Kiểm tra lại kho hàng tồn đợt 1', from: 'Administrator', to: 'Nhân viên 2', done: false },
  { id: 12, due: '08/12/2025', priority: 'normal', content: 'Đăng bài quảng cáo lên Fanpage', from: 'Administrator', to: 'Nhân viên 3', done: false },
  { id: 13, due: '08/12/2025', priority: 'normal', content: 'Đào tạo nhân viên mới về quy trình sale', from: 'Administrator', to: 'Tất cả', done: false },
  { id: 14, due: '08/12/2025', priority: 'normal', content: 'Chuẩn bị tài liệu hội thảo ngày 15/6', from: 'Administrator', to: 'Nhân viên 1', done: false },
  { id: 15, due: '08/12/2025', priority: 'normal', content: 'Mua hoa chúc mừng sinh nhật sếp', from: 'Administrator', to: 'Tất cả', done: false },
  { id: 16, due: '08/12/2025', priority: 'normal', content: 'Cập nhật bảng giá mới lên website', from: 'Administrator', to: 'Nhân viên 3', done: false },
  { id: 17, due: '08/12/2025', priority: 'normal', content: 'Rà soát lại hợp đồng đã hết hạn', from: 'Administrator', to: 'Nhân viên 1', done: false },
  { id: 18, due: '08/12/2025', priority: 'normal', content: 'Sắp xếp lại kho lưu trữ hồ sơ', from: 'Administrator', to: 'Nhân viên 2', done: false },
];

const emptyTask = { due: '', priority: 'normal', content: '', from: 'Administrator', to: '' };

export default function CrmTasks({ onNavigate, onChangePassword, onLogout }) {
  const [tasks, setTasks] = useIndexedDbState('tasks', initialTasks);
  const [employees] = useIndexedDbState('employees', DEFAULT_EMPLOYEES);
  const [tab, setTab] = useState('todo'); // 'todo' | 'done'
  const [dueFilter, setDueFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [confirmDoneId, setConfirmDoneId] = useState(null);
  const [taskModal, setTaskModal] = useState(null); // null | {} (add) | task (edit)
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (tab === 'todo' ? !t.done : t.done))
      .filter((t) => (dueFilter ? t.due === dueFilter : true))
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return t.content.toLowerCase().includes(q) || t.to.toLowerCase().includes(q) || t.from.toLowerCase().includes(q);
      });
  }, [tasks, tab, dueFilter, search]);

  const todoCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageStart = (pageSafe - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const switchTab = (t) => {
    setTab(t);
    setPage(1);
  };

  const markDone = () => {
    setTasks((list) => list.map((t) => (t.id === confirmDoneId ? { ...t, done: true } : t)));
    setConfirmDoneId(null);
  };

  const deleteTask = () => {
    setTasks((list) => list.filter((t) => t.id !== deleteId));
    setDeleteId(null);
  };

  const openAdd = () => setTaskModal({ ...emptyTask });
  const openEdit = (task) => setTaskModal({ ...task });

  const saveTask = () => {
    if (!taskModal.content || !taskModal.due) return;
    if (taskModal.id) {
      setTasks((list) => list.map((t) => (t.id === taskModal.id ? taskModal : t)));
    } else {
      setTasks((list) => [...list, { ...taskModal, id: Date.now(), done: false }]);
    }
    setTaskModal(null);
  };

  return (
    <>
      <CrmHeader activeNav="reminders" onNavChange={onNavigate} onChangePassword={onChangePassword} onLogout={onLogout} />

      <div className="crm-tasks-page">
        {/* Toolbar */}
        <div className="crm-tasks-toolbar">
          <span className="crm-tasks-toolbar-label">Hạn:</span>
          <input
            type="date"
            className="crm-tasks-date-input"
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
          />
          <input
            type="text"
            className="crm-tasks-search-input"
            placeholder="Tìm việc, người giao"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <button className="crm-add-task-btn" onClick={openAdd}>
            <IconPlus /> Thêm
          </button>
        </div>

        {/* Tabs + pagination */}
        <div className="crm-tasks-tabbar">
          <div className="crm-tasks-tabs">
            <button className={`crm-tasks-tab${tab === 'todo' ? ' active' : ''}`} onClick={() => switchTab('todo')}>
              Cần làm <span className="crm-tasks-tab-count">{todoCount}</span>
            </button>
            <button className={`crm-tasks-tab${tab === 'done' ? ' active' : ''}`} onClick={() => switchTab('done')}>
              Đã xong <span className="crm-tasks-tab-count">{doneCount}</span>
            </button>
          </div>

          {filtered.length > 0 && (
            <div className="crm-tasks-pagination">
              <span>
                {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filtered.length)} / {filtered.length}
              </span>
              <button
                className="crm-page-btn"
                disabled={pageSafe === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <IconChevronLeft />
              </button>
              <span>
                {pageSafe}/{totalPages}
              </span>
              <button
                className="crm-page-btn"
                disabled={pageSafe === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <IconChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="crm-tasks-table-wrap">
          <table className="crm-tasks-table">
            <thead>
              <tr>
                <th>Hạn</th>
                <th>Mức độ</th>
                <th>Nội dung công việc</th>
                <th>Người gửi</th>
                <th>Người nhận</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((t) => (
                <tr key={t.id}>
                  <td>{t.due}</td>
                  <td>
                    <span className={`crm-priority-badge ${t.priority === 'urgent' ? 'urgent' : 'normal'}`}>
                      {t.priority === 'urgent' ? 'Gấp' : 'Thường'}
                    </span>
                  </td>
                  <td>{t.content}</td>
                  <td>{t.from}</td>
                  <td>{t.to}</td>
                  <td>
                    {t.done ? (
                      <span className="crm-status-pill done">
                        <IconCheck /> Đã xong
                      </span>
                    ) : (
                      <span className="crm-status-pill waiting">
                        <IconClock /> Đang chờ
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="crm-task-actions">
                      {!t.done && (
                        <button className="crm-task-action-btn done" onClick={() => setConfirmDoneId(t.id)} title="Đánh dấu đã xong">
                          <IconCheck />
                        </button>
                      )}
                      <button className="crm-task-action-btn edit" onClick={() => openEdit(t)} title="Sửa">
                        <IconEdit />
                      </button>
                      <button className="crm-task-action-btn delete" onClick={() => setDeleteId(t.id)} title="Xóa">
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageItems.length === 0 && <div className="crm-tasks-empty">Không có công việc nào.</div>}
        </div>
      </div>

      {/* Confirm mark-as-done modal */}
      {confirmDoneId && (
        <div className="crm-modal-overlay" onClick={() => setConfirmDoneId(null)}>
          <div className="crm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crm-confirm-icon-wrap info">
              <IconHelp />
            </div>
            <h3 className="crm-confirm-title">Xác nhận</h3>
            <p className="crm-confirm-text">
              Bạn có chắc chắn muốn đánh dấu công việc này là <strong>"Đã xong"</strong>?
            </p>
            <div className="crm-confirm-actions">
              <button className="crm-btn-cancel" onClick={() => setConfirmDoneId(null)}>
                Hủy
              </button>
              <button className="crm-btn-confirm" onClick={markDone}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {deleteId && (
        <div className="crm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="crm-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crm-confirm-icon-wrap danger">
              <IconTrash />
            </div>
            <h3 className="crm-confirm-title">Xác nhận xóa</h3>
            <p className="crm-confirm-text">
              Bạn có chắc chắn muốn xóa công việc này?
            </p>
            <div className="crm-confirm-actions">
              <button className="crm-btn-cancel" onClick={() => setDeleteId(null)}>
                Hủy
              </button>
              <button className="crm-btn-confirm danger" onClick={deleteTask}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / edit task modal */}
      {taskModal && (
        <div className="crm-modal-overlay" onClick={() => setTaskModal(null)}>
          <div className="crm-task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h3>{taskModal.id ? 'Sửa công việc' : 'Thêm công việc mới'}</h3>
              <button className="crm-modal-close" onClick={() => setTaskModal(null)}>
                ×
              </button>
            </div>

            <div className="crm-form-row">
              <div className="crm-form-group">
                <label>Hạn *</label>
                <input
                  type="date"
                  value={taskModal.due}
                  onChange={(e) => setTaskModal({ ...taskModal, due: e.target.value })}
                />
              </div>
              <div className="crm-form-group">
                <label>Mức độ</label>
                <select
                  value={taskModal.priority}
                  onChange={(e) => setTaskModal({ ...taskModal, priority: e.target.value })}
                >
                  <option value="urgent">Gấp</option>
                  <option value="normal">Thường</option>
                </select>
              </div>
            </div>

            <div className="crm-form-group">
              <label>Nội dung công việc *</label>
              <textarea
                value={taskModal.content}
                onChange={(e) => setTaskModal({ ...taskModal, content: e.target.value })}
              />
            </div>

            <div className="crm-form-row">
              <div className="crm-form-group">
                <label>Người nhận</label>
                <input
                  type="text"
                  list="crm-task-employees"
                  placeholder="Nhân viên 1, Nhân viên 2..."
                  value={taskModal.to}
                  onChange={(e) => setTaskModal({ ...taskModal, to: e.target.value })}
                />
                <datalist id="crm-task-employees">
                  <option value="Tất cả" />
                  {employees.map(employee => <option key={employee.id} value={employee.name} />)}
                </datalist>
              </div>
              <div className="crm-form-group">
                <label>Người gửi</label>
                <select
                  value={taskModal.from}
                  onChange={(e) => setTaskModal({ ...taskModal, from: e.target.value })}
                >
                  {employees.map(employee => <option key={employee.id} value={employee.name}>{employee.name}</option>)}
                </select>
              </div>
            </div>

            <div className="crm-modal-actions">
              <button className="crm-btn-cancel" onClick={() => setTaskModal(null)}>
                Hủy
              </button>
              <button className="crm-btn-confirm" onClick={saveTask}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
