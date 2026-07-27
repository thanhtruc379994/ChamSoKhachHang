import { X, Save, UserPlus } from "lucide-react";

const EMPTY_CUSTOMER = {
  name: "", phone: "", source: "Facebook", area: "", status: "Khách hàng mới",
  staff: "Administrator", address: "", note: "", revenue: "---",
};

export default function CustomerFormModal({ customer, onClose, onSave }) {
  const data = customer || EMPTY_CUSTOMER;

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
          <label>Nguồn khách hàng<select name="source" defaultValue={data.source}>{["Facebook","Website","Giới thiệu","Kiot"].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Khu vực<input name="area" defaultValue={data.area} placeholder="Hà Nội, Đà Lạt..." /></label>
          <label>Trạng thái<select name="status" defaultValue={data.status}>{["Khách hàng mới","Đã gửi thông tin","Đang thuyết phục","Đã gửi báo giá","Đã chốt","Không quan tâm"].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Nhân viên phụ trách<select name="staff" defaultValue={data.staff}>{["Administrator","Nhân viên 1","Nhân viên 2","Nhân viên 3"].map(x => <option key={x}>{x}</option>)}</select></label>
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
