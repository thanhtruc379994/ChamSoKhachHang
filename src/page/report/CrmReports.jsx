import { BarChart3, CalendarDays, Star, Users, Trophy, Share2, MapPin, Phone } from 'lucide-react';
import CrmHeader from '../../components/header/CrmHeader';
import './CrmReports.css';

const statusLegend = [
  ['#4f7ee8', 'Khách hàng mới'], ['#d45b9b', 'Đã gửi thông tin'],
  ['#67c6d2', 'Đã gửi báo giá'], ['#49b989', 'Đã chốt'], ['#655be8', 'Đang thuyết phục'],
];

function Legend({ items = statusLegend }) {
  return <div className="report-legend">{items.map(([color, label]) => (
    <span key={label}><i style={{ background: color }} />{label}</span>
  ))}</div>;
}

function Card({ title, icon: Icon = BarChart3, children }) {
  return (
    <section className="report-chart-card">
      <h3><Icon size={17} />{title}</h3>
      {children}
    </section>
  );
}

function PieChart({ donut = false }) {
  return (
    <div className={`report-pie ${donut ? 'donut' : ''}`}>
      {donut && <div className="report-pie-hole" />}
    </div>
  );
}

function GridChart({ children, className = '' }) {
  return <div className={`report-grid-chart ${className}`}>{children}</div>;
}

function ReportsBars() {
  const data = [
    ['Administrator', 96, 58, 32, 22],
    ['Nhân viên 1', 48, 34, 17, 10],
    ['Nhân viên 2', 34, 24, 14, 8],
    ['Nhân viên 3', 8, 5, 2, 1],
  ];
  return <GridChart className="employee-bars">{data.map(([name, ...values]) => (
    <div className="employee-bar-item" key={name}>
      <div className="stack-bar">{values.map((value, i) => (
        <i key={i} style={{ height: `${value}%`, background: statusLegend[i][0] }} />
      ))}</div>
      <span>{name}</span>
    </div>
  ))}</GridChart>;
}

function LineChart({ monthly = false }) {
  return (
    <GridChart className="line-chart">
      <svg viewBox="0 0 420 205" preserveAspectRatio="none" aria-label="Biểu đồ xu hướng">
        <polyline className="blue-line" points={monthly ? '10,188 55,188 100,188 145,188 190,188 235,188 280,188 325,188 370,188 410,24' : '10,65 65,120 115,20 165,145 220,130 280,130 340,130 410,130'} />
        {!monthly && <polyline className="green-line" points="10,130 65,125 115,188 165,188 220,20 280,188 340,188 410,188" />}
      </svg>
      <div className="chart-axis-labels">
        {(monthly ? ['02/2025','04/2025','06/2025','08/2025','10/2025','12/2025','01/2026'] : ['7/1/2026','8/1/2026','9/1/2026','10/1/2026','11/1/2026','12/1/2026','13/1/2026','14/1/2026']).map(x => <span key={x}>{x}</span>)}
      </div>
    </GridChart>
  );
}

function HorizontalBars({ source = false }) {
  const rows = source
    ? [['Facebook', 66, 0], ['Website', 34, 17], ['Giới thiệu', 0, 17], ['Kiot', 84, 17]]
    : [['Hồ Chí Minh', 34, 0], ['Đà Lạt', 84, 0], ['Thanh Hóa', 60, 14], ['Hà Nội', 22, 8]];
  return <div className="horizontal-bars">{rows.map(([label, blue, green]) => (
    <div className="horizontal-row" key={label}>
      <span>{label}</span><div><i className="green" style={{ width: `${green}%` }} /><i className="blue" style={{ width: `${blue}%` }} /></div>
    </div>
  ))}</div>;
}

function Ranking({ revenue = true }) {
  const rows = revenue
    ? [['KH9 - Chị Thắm', '1.200.000'], ['KH11 - Anh Hải', '580.000'], ['KH7 - Anh Minh', '200.000']]
    : [['Administrator', '1.400.000'], ['Nhân viên 1', '580.000']];
  return <div className="report-ranking">{rows.map(([name, value], index) => (
    <div key={name}><b>{index + 1}</b><span>{name}</span><strong>{value}</strong></div>
  ))}</div>;
}

export default function CrmReports({ onNavigate, onChangePassword, onLogout }) {
  return (
    <div className="crm-reports">
      <CrmHeader activeNav="reports" onNavChange={onNavigate} onChangePassword={onChangePassword} onLogout={onLogout} />
      <main className="reports-page">
        <div className="report-filters">
          <label>Từ ngày:<input type="date" defaultValue="2026-01-01" /></label>
          <label>Đến ngày:<input type="date" defaultValue="2026-01-31" /></label>
          <label>Nhân viên:<select defaultValue="all"><option value="all">Tất cả nhân viên</option><option>Administrator</option><option>Nhân viên 1</option></select></label>
          <button>Reset</button>
        </div>

        <div className="report-summary">
          <article><Users /><div><b>14</b><span>Tổng khách hàng</span></div></article>
          <article><BarChart3 /><div><b>1.980.000 (6 đơn)</b><span>Tổng doanh thu</span></div></article>
          <article><CalendarDays /><div><b>1</b><span>Khách hàng hôm nay</span></div></article>
          <article><Star /><div><b>Administrator</b><span>Nhân viên tích cực nhất</span></div></article>
        </div>

        <div className="report-dashboard">
          <Card title="Phân bố theo trạng thái"><Legend /><PieChart /></Card>
          <Card title="Khách hàng theo nhân viên"><Legend /><ReportsBars /></Card>
          <Card title="Xu hướng theo ngày"><Legend items={[[ '#4f67ad','Khách hàng mới' ],['#43b58a','Đơn hàng đã chốt']]} /><LineChart /></Card>
          <Card title="Khách hàng theo nguồn" icon={Share2}><Legend items={[[ '#43b58a','Đã chốt' ],['#4f67ad','Chưa chốt']]} /><HorizontalBars source /></Card>

          <Card title="Top sale chốt" icon={Trophy}><Legend items={[[ '#43b58a','Tỷ lệ chốt (%)' ],['#4f67ad','Số khách hàng đã chốt']]} /><ReportsBars /></Card>
          <Card title="Theo dõi theo tháng" icon={CalendarDays}><Legend items={[[ '#4f67ad','Khách hàng mới' ],['#43b58a','Đơn hàng đã chốt']]} /><LineChart monthly /></Card>
          <Card title="Top doanh thu theo khách hàng" icon={Trophy}><Ranking /></Card>
          <Card title="Doanh thu theo nguồn khách"><Legend items={[[ '#3479e8','Website' ],['#d45b9b','Giới thiệu'],['#655be8','Kiot']]} /><PieChart donut /></Card>

          <Card title="Doanh thu theo nhân viên" icon={Users}><Ranking revenue={false} /></Card>
          <Card title="Số cuộc gọi theo nhân viên" icon={Phone}><Ranking revenue={false} /></Card>
          <Card title="Khách hàng theo Khu vực" icon={MapPin}><Legend items={[[ '#43b58a','Đã chốt' ],['#4f67ad','Chưa chốt']]} /><HorizontalBars /></Card>
          <Card title="Doanh thu theo Khu vực" icon={MapPin}><Legend items={[[ '#3479e8','Thanh Hóa' ],['#d45b9b','Hà Nội']]} /><PieChart donut /></Card>
        </div>
      </main>
    </div>
  );
}
