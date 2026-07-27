import { X, Save, UserPlus } from "lucide-react";

const EMPTY_CUSTOMER = {
  name: "", phone: "", source: "Facebook", area: "", status: "Khách hàng mới",
  staff: "Administrator", address: "", note: "", revenue: "---",
};

export default function CustomerFormModal({ customer, statuses, employees, sources, onClose, onSave }) {
  const data = customer || {
    ...EMPTY_CUSTOMER,
    status: statuses[0]?.name || EMPTY_CUSTOMER.status,
    source: sources[0]?.name || EMPTY_CUSTOMER.source,
    staff: employees[0]?.name || EMPTY_CUSTOMER.staff,
  };

  const submit = (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!values.name.trim()) return;
    onSave({ ...data, ...values });
  };

  return (
    <div className="crm-dialog-overlay" onMouseDown={onClose}>
      <form className="crm-customer-form" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <div className="crm-dialog-header">
          <div><UserPlus size={19} /><div><h2>{customer ? "Cập nhật khách hàng" : "Thêm khách hàng"}</h2><p>Nhập thông tin liên hệ và chăm sóc khách hàng</p></div></div>
          <button type="button" onClick={onClose} aria-label="Đóng"><X size={19} /></button>
        </div>
        <div className="crm-form-grid">
          <label>Họ và tên <em>*</em><input name="name" defaultValue={data.name} required placeholder="Ví dụ: Anh Nguyễn Văn A" /></label>
          <label>Số điện thoại<input name="phone" defaultValue={data.phone} placeholder="090..." /></label>
          <label>Nguồn khách hàng<select name="source" defaultValue={data.source}>{sources.map(source => <option key={source.id} value={source.name}>{source.name}</option>)}</select></label>
          <label>Khu vực<input name="area" defaultValue={data.area} placeholder="Hà Nội, Đà Lạt..." /></label>
          <label>Trạng thái<select name="status" defaultValue={data.status}>{statuses.map(status => <option key={status.id} value={status.name}>{status.name}</option>)}</select></label>
          <label>Nhân viên phụ trách<select name="staff" defaultValue={data.staff}>{employees.map(employee => <option key={employee.id} value={employee.name}>{employee.name}</option>)}</select></label>
          <label className="wide">Địa chỉ<input name="address" defaultValue={data.address} placeholder="Địa chỉ khách hàng" /></label>
          <label className="wide">Ghi chú<textarea name="note" defaultValue={data.note} rows="4" placeholder="Nội dung cần lưu ý..." /></label>
        </div>
        <div className="crm-dialog-actions">
          <button type="button" className="cancel" onClick={onClose}>Hủy</button>
          <button type="submit" className="save"><Save size={15} /> Lưu khách hàng</button>
        </div>
      </form>
    </div>
  );
}
