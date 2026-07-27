import { BarChart3, CalendarDays, Star, Users, Trophy, Share2, MapPin, Phone } from 'lucide-react';
import CrmHeader from '../../components/header/CrmHeader';
import { useIndexedDbState } from '../../data/indexedDb';
import { DEFAULT_EMPLOYEES, DEFAULT_SOURCES, DEFAULT_STATUSES } from '../../data/crmOptions';
import './CrmReports.css';

const defaultStatusLegend = DEFAULT_STATUSES.map((status) => [status.color, status.name]);

function Legend({ items = defaultStatusLegend }) {
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

function PieChart({ donut = false, legend = defaultStatusLegend }) {
  const values = donut
    ? legend.map(([, label], index) => [label, [61, 29, 10, 0][index] || 0])
    : legend.map(([, label], index) => [label, [15, 28, 21, 20, 16, 0][index] || 0]);
  const tooltip = values.map(([label, value]) => `${label}: ${value}%`).join(' • ');
  let total = 0;
  const pieBackground = `conic-gradient(${values.map(([, value], index) => {
    const start = total;
    total += value;
    return `${legend[index][0]} ${start}% ${total}%`;
  }).join(',')})`;

  return (
    <div
      className={`report-pie report-tooltip ${donut ? 'donut' : ''}`}
      data-tooltip={tooltip}
      tabIndex="0"
      aria-label={tooltip}
      style={{ background: pieBackground }}
    >
      {donut && <div className="report-pie-hole" />}
    </div>
  );
}

function GridChart({ children, className = '' }) {
  return <div className={`report-grid-chart ${className}`}>{children}</div>;
}

function ReportsBars({ legend = defaultStatusLegend }) {
  const data = [
    ['Administrator', 96, 58, 32, 22, 12, 6],
    ['Nhân viên 1', 48, 34, 17, 10, 7, 3],
    ['Nhân viên 2', 34, 24, 14, 8, 4, 2],
    ['Nhân viên 3', 8, 5, 2, 1, 1, 0],
  ];
  return <GridChart className="employee-bars">{data.map(([name, ...values]) => (
    <div className="employee-bar-item" key={name}>
      <div className="stack-bar">{values.slice(0, legend.length).map((value, i) => (
        <i
          className="report-tooltip"
          data-tooltip={`${name} • ${legend[i]?.[1] || `Trạng thái ${i + 1}`}: ${value}`}
          key={i}
          style={{ height: `${value}%`, background: legend[i]?.[0] || '#64748b' }}
          tabIndex="0"
        />
      ))}</div>
      <span>{name}</span>
    </div>
  ))}</GridChart>;
}

function LineChart({ monthly = false }) {
  const dates = monthly
    ? ['02/2025','04/2025','06/2025','08/2025','10/2025','12/2025','01/2026']
    : ['7/1/2026','8/1/2026','9/1/2026','10/1/2026','11/1/2026','12/1/2026','13/1/2026','14/1/2026'];
  const bluePoints = monthly
    ? [[10,188],[55,188],[100,188],[145,188],[190,188],[235,188],[280,188],[325,188],[370,188],[410,24]]
    : [[10,65],[65,120],[115,20],[165,145],[220,130],[280,130],[340,130],[410,130]];
  const greenPoints = [[10,130],[65,125],[115,188],[165,188],[220,20],[280,188],[340,188],[410,188]];
  const blueValues = monthly ? [0,0,0,0,0,0,14] : [9,5,12,3,4,4,4,4];
  const greenValues = [4,4,0,0,12,0,0,0];

  return (
    <GridChart className="line-chart">
      <svg viewBox="0 0 420 205" preserveAspectRatio="none" aria-label="Biểu đồ xu hướng">
        <polyline className="blue-line" points={bluePoints.map((point) => point.join(',')).join(' ')} />
        {bluePoints.slice(monthly ? 3 : 0).map(([x, y], index) => (
          <circle className="blue-point" cx={x} cy={y} r="5" key={`${x}-${y}`}>
            <title>{`${dates[Math.min(index, dates.length - 1)]} • Khách hàng mới: ${blueValues[Math.min(index, blueValues.length - 1)]}`}</title>
          </circle>
        ))}
        {!monthly && <>
          <polyline className="green-line" points={greenPoints.map((point) => point.join(',')).join(' ')} />
          {greenPoints.map(([x, y], index) => (
            <circle className="green-point" cx={x} cy={y} r="5" key={`${x}-${y}`}>
              <title>{`${dates[index]} • Đơn hàng đã chốt: ${greenValues[index]}`}</title>
            </circle>
          ))}
        </>}
      </svg>
      <div className="chart-axis-labels">
        {dates.map(x => <span key={x}>{x}</span>)}
      </div>
    </GridChart>
  );
}

function HorizontalBars({ source = false, sources = DEFAULT_SOURCES }) {
  const rows = source
    ? sources.map((item, index) => [item.name, [66, 34, 0, 84][index] || 0, [0, 17, 17, 17][index] || 0])
    : [['Hồ Chí Minh', 34, 0], ['Đà Lạt', 84, 0], ['Thanh Hóa', 60, 14], ['Hà Nội', 22, 8]];
  return <div className="horizontal-bars">{rows.map(([label, blue, green]) => (
    <div className="horizontal-row" key={label}>
      <span>{label}</span>
      <div>
        {green > 0 && <i className="green report-tooltip" data-tooltip={`${label} • Đã chốt: ${green}`} style={{ width: `${green}%` }} tabIndex="0" />}
        {blue > 0 && <i className="blue report-tooltip" data-tooltip={`${label} • Chưa chốt: ${blue}`} style={{ width: `${blue}%` }} tabIndex="0" />}
      </div>
    </div>
  ))}</div>;
}

function Ranking({ revenue = true, employees = DEFAULT_EMPLOYEES }) {
  const rows = revenue
    ? [['KH9 - Chị Thắm', '1.200.000'], ['KH11 - Anh Hải', '580.000'], ['KH7 - Anh Minh', '200.000']]
    : employees.slice(0, 3).map((employee, index) => [employee.name, ['1.400.000', '580.000', '200.000'][index]]);
  return <div className="report-ranking">{rows.map(([name, value], index) => (
    <div key={name}><b>{index + 1}</b><span>{name}</span><strong>{value}</strong></div>
  ))}</div>;
}

export default function CrmReports({ onNavigate, onChangePassword, onLogout }) {
  const [statuses] = useIndexedDbState('statuses', DEFAULT_STATUSES);
  const [employees] = useIndexedDbState('employees', DEFAULT_EMPLOYEES);
  const [sources] = useIndexedDbState('sources', DEFAULT_SOURCES);
  const currentStatusLegend = statuses.map((status) => [status.color, status.name]);
  const sourceLegend = sources.map((source, index) => [['#3479e8', '#d45b9b', '#655be8', '#43b58a'][index] || '#64748b', source.name]);

  return (
    <div className="crm-reports">
      <CrmHeader activeNav="reports" onNavChange={onNavigate} onChangePassword={onChangePassword} onLogout={onLogout} />
      <main className="reports-page">
        <div className="report-filters">
          <label>Từ ngày:<input type="date" defaultValue="2026-01-01" /></label>
          <label>Đến ngày:<input type="date" defaultValue="2026-01-31" /></label>
          <label>Nhân viên:<select defaultValue="all"><option value="all">Tất cả nhân viên</option>{employees.map(employee => <option key={employee.id} value={employee.name}>{employee.name}</option>)}</select></label>
          <button>Reset</button>
        </div>

        <div className="report-summary">
          <article><Users /><div><b>14</b><span>Tổng khách hàng</span></div></article>
          <article><BarChart3 /><div><b>1.980.000 (6 đơn)</b><span>Tổng doanh thu</span></div></article>
          <article><CalendarDays /><div><b>1</b><span>Khách hàng hôm nay</span></div></article>
          <article><Star /><div><b>Administrator</b><span>Nhân viên tích cực nhất</span></div></article>
        </div>

        <div className="report-dashboard">
          <Card title="Phân bố theo trạng thái"><Legend items={currentStatusLegend} /><PieChart legend={currentStatusLegend} /></Card>
          <Card title="Khách hàng theo nhân viên"><Legend items={currentStatusLegend} /><ReportsBars legend={currentStatusLegend} /></Card>
          <Card title="Xu hướng theo ngày"><Legend items={[[ '#4f67ad','Khách hàng mới' ],['#43b58a','Đơn hàng đã chốt']]} /><LineChart /></Card>
          <Card title="Khách hàng theo nguồn" icon={Share2}><Legend items={[[ '#43b58a','Đã chốt' ],['#4f67ad','Chưa chốt']]} /><HorizontalBars source sources={sources} /></Card>

          <Card title="Top sale chốt" icon={Trophy}><Legend items={[[ '#43b58a','Tỷ lệ chốt (%)' ],['#4f67ad','Số khách hàng đã chốt']]} /><ReportsBars /></Card>
          <Card title="Theo dõi theo tháng" icon={CalendarDays}><Legend items={[[ '#4f67ad','Khách hàng mới' ],['#43b58a','Đơn hàng đã chốt']]} /><LineChart monthly /></Card>
          <Card title="Top doanh thu theo khách hàng" icon={Trophy}><Ranking /></Card>
          <Card title="Doanh thu theo nguồn khách"><Legend items={sourceLegend} /><PieChart donut legend={sourceLegend} /></Card>

          <Card title="Doanh thu theo nhân viên" icon={Users}><Ranking revenue={false} employees={employees} /></Card>
          <Card title="Số cuộc gọi theo nhân viên" icon={Phone}><Ranking revenue={false} employees={employees} /></Card>
          <Card title="Khách hàng theo Khu vực" icon={MapPin}><Legend items={[[ '#43b58a','Đã chốt' ],['#4f67ad','Chưa chốt']]} /><HorizontalBars /></Card>
          <Card title="Doanh thu theo Khu vực" icon={MapPin}><Legend items={[[ '#3479e8','Thanh Hóa' ],['#d45b9b','Hà Nội']]} /><PieChart donut legend={[[ '#3479e8','Thanh Hóa' ],['#d45b9b','Hà Nội']]} /></Card>
        </div>
      </main>
    </div>
  );
}
