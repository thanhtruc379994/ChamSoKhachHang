export const DEFAULT_STATUSES = [
  { id: 1, name: 'Khách hàng mới', color: '#2563eb', system: true },
  { id: 2, name: 'Đã gửi thông tin', color: '#ec4899', system: false },
  { id: 3, name: 'Đang thuyết phục', color: '#6366f1', system: false },
  { id: 4, name: 'Đã gửi báo giá', color: '#06b6d4', system: false },
  { id: 5, name: 'Đã chốt', color: '#22c55e', system: true },
  { id: 6, name: 'Không quan tâm', color: '#ef4444', system: false },
];

export const DEFAULT_EMPLOYEES = [
  { id: 1, name: 'Administrator', role: 'Admin', manager: null, username: 'admin', password: '' },
  { id: 2, name: 'Nhân viên 1', role: 'Nhân viên', manager: null, username: 'nv1', password: 'a123' },
  { id: 3, name: 'Nhân viên 2', role: 'Nhân viên', manager: 'Nhân viên 1', username: 'nv2', password: 'a123' },
  { id: 4, name: 'Nhân viên 3', role: 'Nhân viên', manager: 'Nhân viên 2', username: 'nv3', password: 'a124' },
];

export const DEFAULT_SOURCES = [
  { id: 1, name: 'Facebook', desc: 'Khách hàng từ quảng cáo Facebook' },
  { id: 2, name: 'Website', desc: 'Khách hàng đăng ký từ website' },
  { id: 3, name: 'Giới thiệu', desc: 'Khách hàng được giới thiệu' },
  { id: 4, name: 'Kiot', desc: 'Khách hàng tại cửa hàng' },
];

export const getStatusColor = (statuses, name) =>
  statuses.find((status) => status.name === name)?.color || '#64748b';
