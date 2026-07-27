import { useMemo, useState } from 'react';
import CrmHeader from '../../components/header/CrmHeader';
import { useIndexedDbState } from '../../data/indexedDb';
import './CrmHistory.css';

const PAGE_SIZE = 16;

const IconChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const CATEGORY_LABEL = {
  khachhang: 'Khách hàng',
  lichsu: 'Lịch sử chăm sóc',
  donhang: 'Đơn hàng',
};

const CATEGORY_CLASS = {
  khachhang: 'cat-khachhang',
  lichsu: 'cat-lichsu',
  donhang: 'cat-donhang',
};

const initialLogs = [
  { id: 1, time: '18:57', user: 'Nhân viên 2', action: 'sua', category: 'khachhang', customer: 'Khách hàng 27', detail: 'Trạng thái: Đang thuyết phục -> Đã gửi báo giá', date: '2025-12-08' },
  { id: 2, time: '15:53', user: 'Nhân viên 1', action: 'them', category: 'lichsu', customer: 'Khách hàng 25', detail: '2025-12-08: Gọi điện tư vấn chi tiết sản phẩm C', date: '2025-12-08' },
  { id: 3, time: '15:53', user: 'Nhân viên 1', action: 'sua', category: 'lichsu', customer: 'Khách hàng 25', detail: 'NV: Administrator -> Nhân viên 1', date: '2025-12-08' },
  { id: 4, time: '15:53', user: 'Nhân viên 1', action: 'sua', category: 'lichsu', customer: 'Khách hàng 25', detail: 'Nội dung: [Chăm sóc lần 1] -> [Gọi điện giới thiệu ...]', date: '2025-12-08' },
  { id: 5, time: '15:45', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 15', detail: '2025-12-08: Chăm sóc lần 2', date: '2025-12-08' },
  { id: 6, time: '15:45', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 15', detail: '2025-12-08: Chăm sóc lần 1', date: '2025-12-08' },
  { id: 7, time: '15:41', user: 'Administrator', action: 'xoa', category: 'donhang', customer: 'Khách hàng 25', detail: 'Mã đơn: DH002', date: '2025-12-08' },
  { id: 8, time: '15:41', user: 'Administrator', action: 'xoa', category: 'lichsu', customer: 'Khách hàng 25', detail: 'Nội dung: Chăm sóc lần 3', date: '2025-12-08' },
  { id: 9, time: '15:41', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 26', detail: '2025-12-08: Đã chốt lần 2', date: '2025-12-08' },
  { id: 10, time: '15:40', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 26', detail: '2025-12-08: Đã chốt lần 1', date: '2025-12-08' },
  { id: 11, time: '15:40', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 26', detail: '2025-12-08: Đã tư vấn chuyên sâu sản phẩm C, và đợi phản hồi', date: '2025-12-08' },
  { id: 12, time: '15:40', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 26', detail: '2025-12-08: Khách hàng đi vắng đợi vài hôm gọi lại tư vấn', date: '2025-12-08' },
  { id: 13, time: '15:39', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 26', detail: '2025-12-08: Khách hàng chuyển hướng sang sản phẩm C', date: '2025-12-08' },
  { id: 14, time: '15:39', user: 'Administrator', action: 'sua', category: 'lichsu', customer: 'Khách hàng 26', detail: 'Nội dung: [Chăm sóc lần 3] -> [Quan tâm sản phẩm B ...]', date: '2025-12-08' },
  { id: 15, time: '15:39', user: 'Administrator', action: 'sua', category: 'lichsu', customer: 'Khách hàng 26', detail: 'Nội dung: [Chăm sóc lần 1] -> [Khách hàng cần tư vấ...]', date: '2025-12-08' },
  { id: 16, time: '15:38', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 17', detail: '2025-12-08: Khách hàng cần nhắc hỏi ý kiến người nhà', date: '2025-12-08' },
  { id: 17, time: '15:30', user: 'Administrator', action: 'them', category: 'lichsu', customer: 'Khách hàng 12', detail: '2025-12-08: Đã gọi lại tư vấn gói cao cấp', date: '2025-12-08' },
  { id: 18, time: '15:20', user: 'Nhân viên 3', action: 'sua', category: 'khachhang', customer: 'Khách hàng 9', detail: 'Số điện thoại: 090xxxxx -> 091xxxxx', date: '2025-12-08' },
  { id: 19, time: '15:10', user: 'Administrator', action: 'them', category: 'donhang', customer: 'Khách hàng 3', detail: 'Mã đơn: DH009', date: '2025-12-08' },
];

export default function CrmHistory({ onNavigate, onChangePassword, onLogout }) {
  const [logs] = useIndexedDbState('history', initialLogs);
  const [dateFilter, setDateFilter] = useState('2025-12-08');
  const [actionFilter, setActionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return logs
      .filter((l) => (dateFilter ? l.date === dateFilter : true))
      .filter((l) => (actionFilter === 'all' ? true : l.action === actionFilter))
      .filter((l) => (categoryFilter === 'all' ? true : l.category === categoryFilter))
      .filter((l) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          l.customer.toLowerCase().includes(q) ||
          l.detail.toLowerCase().includes(q) ||
          l.user.toLowerCase().includes(q)
        );
      });
  }, [logs, dateFilter, actionFilter, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageStart = (pageSafe - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const updateFilter = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  return (
    <>
      <CrmHeader activeNav="history" onNavChange={onNavigate} onChangePassword={onChangePassword} onLogout={onLogout}/>

      <div className="crm-history-page">
        {/* Toolbar */}
        <div className="crm-history-toolbar">
          <span className="crm-history-toolbar-label">Xem ngày:</span>
          <input
            type="date"
            className="crm-history-date-input"
            value={dateFilter}
            onChange={updateFilter(setDateFilter)}
          />

          <select className="crm-history-select" value={actionFilter} onChange={updateFilter(setActionFilter)}>
            <option value="all">Tất cả hành động</option>
            <option value="them">Thêm</option>
            <option value="sua">Sửa</option>
            <option value="xoa">Xóa</option>
          </select>

          <select className="crm-history-select" value={categoryFilter} onChange={updateFilter(setCategoryFilter)}>
            <option value="all">Tất cả phân loại</option>
            <option value="khachhang">Khách hàng</option>
            <option value="lichsu">Lịch sử chăm sóc</option>
            <option value="donhang">Đơn hàng</option>
          </select>

          <input
            type="text"
            className="crm-history-search-input"
            placeholder="Tìm kiếm trong lịch sử..."
            value={search}
            onChange={updateFilter(setSearch)}
          />

          <span className="crm-history-count">
            Hiển thị {filtered.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filtered.length)} trong
            tổng {filtered.length}
          </span>

          <div className="crm-history-pagination">
            <button
              className="crm-history-page-btn"
              type="button"
              aria-label="Trang trước"
              title="Trang trước"
              disabled={pageSafe === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <IconChevronLeft />
            </button>
            <span className="crm-history-page-label">
              {pageSafe}/{totalPages}
            </span>
            <button
              className="crm-history-page-btn"
              type="button"
              aria-label="Trang sau"
              title="Trang sau"
              disabled={pageSafe === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <IconChevronRight />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="crm-history-table-wrap">
          <table className="crm-history-table">
            <thead>
              <tr>
                <th>Giờ</th>
                <th>Người làm</th>
                <th>Hành động</th>
                <th>Phân loại</th>
                <th>Khách hàng</th>
                <th>Chi tiết thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((l) => (
                <tr key={l.id}>
                  <td>{l.time}</td>
                  <td>{l.user}</td>
                  <td>
                    <span className={`crm-action-badge ${l.action}`}>
                      {l.action === 'them' ? 'Thêm' : l.action === 'sua' ? 'Sửa' : 'Xóa'}
                    </span>
                  </td>
                  <td>
                    <span className={`crm-category-link ${CATEGORY_CLASS[l.category]}`}>
                      {CATEGORY_LABEL[l.category]}
                    </span>
                  </td>
                  <td>{l.customer}</td>
                  <td className="crm-history-detail">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pageItems.length === 0 && <div className="crm-history-empty">Không có dữ liệu lịch sử.</div>}
        </div>
      </div>
    </>
  );
}
