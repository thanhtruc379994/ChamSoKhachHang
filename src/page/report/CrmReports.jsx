import React, { useState, useMemo } from 'react';
import { BarChart3, CalendarDays, Star, Users, Trophy, Share2, MapPin, Phone } from 'lucide-react';
import CrmHeader from '../../components/header/CrmHeader';
import { useIndexedDbState } from '../../data/indexedDb';
import { DEFAULT_EMPLOYEES, DEFAULT_SOURCES, DEFAULT_STATUSES } from '../../data/crmOptions';
import { CUSTOMERS } from '../customer/CrmCustomerList';
import './CrmReports.css';

function fmtMoney(n) {
  if (n === null || n === undefined) return "0";
  return n.toLocaleString("vi-VN");
}

function parseViDate(dateStr) {
  if (!dateStr || dateStr === "---") return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return null;
}

function dateToYmd(d) {
  if (!d || isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getCustomerRevenue(c) {
  if (c.orders && c.orders.length > 0) {
    return c.orders.reduce((sum, o) => sum + (o.value || 0), 0);
  }
  if (c.revenue && c.revenue !== "---") {
    const parsed = parseFloat(String(c.revenue).replace(/[^0-9]/g, ""));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function getCustomerOrderCount(c) {
  if (c.orders && c.orders.length > 0) return c.orders.length;
  if (c.revenue && c.revenue !== "---") return 1;
  return 0;
}

function Legend({ items = [] }) {
  return (
    <div className="report-legend">
      {items.map(([color, label]) => (
        <span key={label}><i style={{ background: color }} />{label}</span>
      ))}
    </div>
  );
}

function Card({ title, icon: Icon = BarChart3, children }) {
  return (
    <section className="report-chart-card">
      <h3><Icon size={17} />{title}</h3>
      {children}
    </section>
  );
}

function PieChart({ donut = false, items = [] }) {
  const totalVal = items.reduce((sum, item) => sum + (item[2] || 0), 0);
  if (totalVal === 0) {
    return (
      <div className="report-pie-empty" style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: "13px" }}>
        Chưa có dữ liệu
      </div>
    );
  }
  const tooltip = items.map(([, label, val]) => {
    const pct = totalVal > 0 ? ((val / totalVal) * 100).toFixed(1) : 0;
    return `${label}: ${pct}%`;
  }).join(' • ');

  let currentTotal = 0;
  const gradientStops = items.map(([color, , val]) => {
    const start = (currentTotal / totalVal) * 100;
    currentTotal += val;
    const end = (currentTotal / totalVal) * 100;
    return `${color} ${start.toFixed(1)}% ${end.toFixed(1)}%`;
  }).join(', ');

  const pieBackground = `conic-gradient(${gradientStops})`;

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

function ReportsBars({ items = [], legend = [] }) {
  return (
    <GridChart className="employee-bars">
      {items.map(({ name, values }) => (
        <div className="employee-bar-item" key={name}>
          <div className="stack-bar">
            {values.map((val, i) => {
              const maxVal = Math.max(...items.flatMap(it => it.values), 1);
              const heightPct = Math.min(100, Math.round((val / maxVal) * 100));
              return (
                <i
                  className="report-tooltip"
                  data-tooltip={`${name} • ${legend[i]?.[1] || `Mục ${i + 1}`}: ${val}`}
                  key={i}
                  style={{ height: `${heightPct}%`, background: legend[i]?.[0] || '#64748b' }}
                  tabIndex="0"
                />
              );
            })}
          </div>
          <span>{name}</span>
        </div>
      ))}
    </GridChart>
  );
}

function LineChart({ dates = [], series = [] }) {
  if (dates.length === 0) {
    return (
      <GridChart className="line-chart">
        <div style={{ textAlign: "center", paddingTop: "80px", color: "#9ca3af", fontSize: "13px" }}>
          Chưa có dữ liệu theo ngày
        </div>
      </GridChart>
    );
  }

  const chartWidth = 420;
  const chartHeight = 160;
  const paddingX = 30;
  const stepX = dates.length > 1 ? (chartWidth - paddingX * 2) / (dates.length - 1) : 0;

  const allVals = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allVals, 1);

  const getY = (val) => chartHeight - (val / maxVal) * (chartHeight - 30);

  return (
    <GridChart className="line-chart">
      <svg viewBox="0 0 420 205" preserveAspectRatio="none" aria-label="Biểu đồ xu hướng">
        {series.map((s, sIdx) => {
          const points = dates.map((_, i) => {
            const x = dates.length === 1 ? chartWidth / 2 : paddingX + i * stepX;
            const y = getY(s.values[i] || 0);
            return `${x},${y}`;
          }).join(' ');

          return (
            <g key={sIdx}>
              <polyline className={sIdx === 0 ? "blue-line" : "green-line"} points={points} style={{ stroke: s.color }} />
              {dates.map((_, i) => {
                const x = dates.length === 1 ? chartWidth / 2 : paddingX + i * stepX;
                const y = getY(s.values[i] || 0);
                const val = s.values[i] || 0;
                return (
                  <circle className={sIdx === 0 ? "blue-point" : "green-point"} cx={x} cy={y} r="5" key={i} style={{ fill: s.color }}>
                    <title>{`${dates[i]} • ${s.label}: ${val}`}</title>
                  </circle>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="chart-axis-labels">
        {dates.map((d) => <span key={d}>{d}</span>)}
      </div>
    </GridChart>
  );
}

function HorizontalBars({ rows = [] }) {
  const maxTotal = Math.max(...rows.map(([, b, g]) => b + g), 1);
  return (
    <div className="horizontal-bars">
      {rows.map(([label, unclosed, closed]) => {
        const closedPct = ((closed / maxTotal) * 100).toFixed(1);
        const unclosedPct = ((unclosed / maxTotal) * 100).toFixed(1);
        return (
          <div className="horizontal-row" key={label}>
            <span>{label}</span>
            <div>
              {closed > 0 && (
                <i className="green report-tooltip" data-tooltip={`${label} • Đã chốt: ${closed}`} style={{ width: `${closedPct}%` }} tabIndex="0" />
              )}
              {unclosed > 0 && (
                <i className="blue report-tooltip" data-tooltip={`${label} • Chưa chốt: ${unclosed}`} style={{ width: `${unclosedPct}%` }} tabIndex="0" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Ranking({ rows = [] }) {
  if (rows.length === 0) {
    return <div style={{ color: "#9ca3af", fontSize: "13px", padding: "16px 0", textAlign: "center" }}>Không có dữ liệu</div>;
  }
  return (
    <div className="report-ranking">
      {rows.map(([name, value], index) => (
        <div key={name}><b>{index + 1}</b><span>{name}</span><strong>{value}</strong></div>
      ))}
    </div>
  );
}

export default function CrmReports({ onNavigate, onChangePassword, onLogout }) {
  const [customers] = useIndexedDbState('customers', CUSTOMERS);
  const [statuses] = useIndexedDbState('statuses', DEFAULT_STATUSES);
  const [employees] = useIndexedDbState('employees', DEFAULT_EMPLOYEES);
  const [sources] = useIndexedDbState('sources', DEFAULT_SOURCES);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setStaffFilter("all");
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (staffFilter !== "all" && c.staff !== staffFilter) return false;
      const cDate = parseViDate(c.createdDate || c.date);
      const cYmd = dateToYmd(cDate);
      if (fromDate && cYmd && cYmd < fromDate) return false;
      if (toDate && cYmd && cYmd > toDate) return false;
      return true;
    });
  }, [customers, staffFilter, fromDate, toDate]);

  // Total metrics
  const totalCustomers = filteredCustomers.length;
  const totalRevenue = useMemo(() => filteredCustomers.reduce((sum, c) => sum + getCustomerRevenue(c), 0), [filteredCustomers]);
  const totalOrders = useMemo(() => filteredCustomers.reduce((sum, c) => sum + getCustomerOrderCount(c), 0), [filteredCustomers]);

  // Today's customers
  const todayYmd = dateToYmd(new Date());
  const todayCount = useMemo(() => filteredCustomers.filter((c) => dateToYmd(parseViDate(c.createdDate || c.date)) === todayYmd).length, [filteredCustomers, todayYmd]);

  // Most active staff
  const mostActiveStaff = useMemo(() => {
    const staffActivityMap = {};
    filteredCustomers.forEach((c) => {
      const staffName = c.staff || "N/A";
      const activityCount = (c.orders ? c.orders.length : 0) + (c.careHistory ? c.careHistory.length : 0) + (c.calls ? c.calls.length : 0);
      staffActivityMap[staffName] = (staffActivityMap[staffName] || 0) + activityCount + 1;
    });
    let topStaff = "---";
    let maxAct = -1;
    Object.entries(staffActivityMap).forEach(([staff, act]) => {
      if (act > maxAct) {
        maxAct = act;
        topStaff = staff;
      }
    });
    return topStaff;
  }, [filteredCustomers]);

  // Status breakdown pie data
  const statusLegend = useMemo(() => statuses.map((s) => [s.color, s.name]), [statuses]);
  const statusPieData = useMemo(() => {
    return statuses.map((s) => {
      const count = filteredCustomers.filter((c) => c.status === s.name).length;
      return [s.color, s.name, count];
    });
  }, [statuses, filteredCustomers]);

  // Employee bars data
  const employeeBarItems = useMemo(() => {
    return employees.map((emp) => {
      const empCusts = filteredCustomers.filter((c) => c.staff === emp.name);
      const values = statuses.map((s) => empCusts.filter((c) => c.status === s.name).length);
      return { name: emp.name, values };
    });
  }, [employees, statuses, filteredCustomers]);

  // Line chart daily trend
  const dailyTrendData = useMemo(() => {
    const map = {};
    filteredCustomers.forEach((c) => {
      const dStr = c.createdDate || c.date || "Khác";
      if (!map[dStr]) map[dStr] = { newCust: 0, closed: 0 };
      map[dStr].newCust += 1;
      if (c.status === "Đã chốt") map[dStr].closed += 1;
    });
    const dates = Object.keys(map);
    const newCusts = dates.map((d) => map[d].newCust);
    const closedCusts = dates.map((d) => map[d].closed);
    return {
      dates,
      series: [
        { color: '#4f67ad', label: 'Khách hàng mới', values: newCusts },
        { color: '#43b58a', label: 'Đơn hàng đã chốt', values: closedCusts },
      ],
    };
  }, [filteredCustomers]);

  // Horizontal bars: source
  const sourceRows = useMemo(() => {
    return sources.map((src) => {
      const srcCusts = filteredCustomers.filter((c) => c.source === src.name);
      const closed = srcCusts.filter((c) => c.status === "Đã chốt").length;
      const unclosed = srcCusts.length - closed;
      return [src.name, unclosed, closed];
    });
  }, [sources, filteredCustomers]);

  // Top sale chốt
  const topSaleBarItems = useMemo(() => {
    return employees.map((emp) => {
      const empCusts = filteredCustomers.filter((c) => c.staff === emp.name);
      const closedCount = empCusts.filter((c) => c.status === "Đã chốt").length;
      const ratePct = empCusts.length > 0 ? Math.round((closedCount / empCusts.length) * 100) : 0;
      return { name: emp.name, values: [ratePct, closedCount] };
    });
  }, [employees, filteredCustomers]);

  // Top revenue by customer ranking
  const topCustomerRanking = useMemo(() => {
    const sorted = [...filteredCustomers].sort((a, b) => getCustomerRevenue(b) - getCustomerRevenue(a));
    return sorted.slice(0, 5).map((c) => [`KH${c.id} - ${c.name}`, fmtMoney(getCustomerRevenue(c))]);
  }, [filteredCustomers]);

  // Source colors
  const sourceColors = ['#3479e8', '#d45b9b', '#655be8', '#43b58a', '#eab308'];
  const sourceLegend = useMemo(() => sources.map((s, i) => [sourceColors[i % sourceColors.length], s.name]), [sources]);
  const revenueBySourceItems = useMemo(() => {
    return sources.map((s, i) => {
      const srcCusts = filteredCustomers.filter((c) => c.source === s.name);
      const rev = srcCusts.reduce((sum, c) => sum + getCustomerRevenue(c), 0);
      return [sourceColors[i % sourceColors.length], s.name, rev];
    });
  }, [sources, filteredCustomers]);

  // Revenue by staff ranking
  const revenueByStaffRanking = useMemo(() => {
    const map = {};
    employees.forEach((emp) => { map[emp.name] = 0; });
    filteredCustomers.forEach((c) => {
      const staffName = c.staff || "Khác";
      map[staffName] = (map[staffName] || 0) + getCustomerRevenue(c);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, rev]) => [name, fmtMoney(rev)]);
  }, [employees, filteredCustomers]);

  // Calls by staff ranking
  const callsByStaffRanking = useMemo(() => {
    const map = {};
    employees.forEach((emp) => { map[emp.name] = 0; });
    filteredCustomers.forEach((c) => {
      const staffName = c.staff || "Khác";
      const callCount = c.calls && c.calls.length > 0
        ? c.calls.reduce((s, call) => s + (call.count || 0), 0)
        : (c.call || 0);
      map[staffName] = (map[staffName] || 0) + callCount;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => [name, `${count} cuộc gọi`]);
  }, [employees, filteredCustomers]);

  // Area rows
  const areaRows = useMemo(() => {
    const areas = [...new Set(customers.map((c) => c.area).filter(Boolean))];
    return areas.map((areaName) => {
      const areaCusts = filteredCustomers.filter((c) => c.area === areaName);
      const closed = areaCusts.filter((c) => c.status === "Đã chốt").length;
      const unclosed = areaCusts.length - closed;
      return [areaName, unclosed, closed];
    });
  }, [customers, filteredCustomers]);

  // Revenue by area donut items
  const areaColors = ['#3479e8', '#d45b9b', '#43b58a', '#eab308', '#8b5cf6'];
  const areaLegend = useMemo(() => {
    const areas = [...new Set(customers.map((c) => c.area).filter(Boolean))];
    return areas.map((a, i) => [areaColors[i % areaColors.length], a]);
  }, [customers]);

  const revenueByAreaItems = useMemo(() => {
    const areas = [...new Set(customers.map((c) => c.area).filter(Boolean))];
    return areas.map((areaName, i) => {
      const areaCusts = filteredCustomers.filter((c) => c.area === areaName);
      const rev = areaCusts.reduce((sum, c) => sum + getCustomerRevenue(c), 0);
      return [areaColors[i % areaColors.length], areaName, rev];
    });
  }, [customers, filteredCustomers]);

  return (
    <div className="crm-reports">
      <CrmHeader activeNav="reports" onNavChange={onNavigate} onChangePassword={onChangePassword} onLogout={onLogout} />
      <main className="reports-page">
        <div className="report-filters">
          <label>
            Từ ngày:
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label>
            Đến ngày:
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label>
            Nhân viên:
            <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
              <option value="all">Tất cả nhân viên</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={handleReset}>Đặt lại</button>
        </div>

        <div className="report-summary">
          <article>
            <Users />
            <div>
              <b>{totalCustomers}</b>
              <span>Tổng khách hàng</span>
            </div>
          </article>
          <article>
            <BarChart3 />
            <div>
              <b>{fmtMoney(totalRevenue)} ({totalOrders} đơn)</b>
              <span>Tổng doanh thu</span>
            </div>
          </article>
          <article>
            <CalendarDays />
            <div>
              <b>{todayCount}</b>
              <span>Khách hàng hôm nay</span>
            </div>
          </article>
          <article>
            <Star />
            <div>
              <b>{mostActiveStaff}</b>
              <span>Nhân viên tích cực nhất</span>
            </div>
          </article>
        </div>

        <div className="report-dashboard">
          <Card title="Phân bố theo trạng thái">
            <Legend items={statusLegend} />
            <PieChart items={statusPieData} />
          </Card>
          <Card title="Khách hàng theo nhân viên">
            <Legend items={statusLegend} />
            <ReportsBars items={employeeBarItems} legend={statusLegend} />
          </Card>
          <Card title="Xu hướng theo ngày">
            <Legend items={[['#4f67ad', 'Khách hàng mới'], ['#43b58a', 'Đơn hàng đã chốt']]} />
            <LineChart dates={dailyTrendData.dates} series={dailyTrendData.series} />
          </Card>
          <Card title="Khách hàng theo nguồn" icon={Share2}>
            <Legend items={[['#43b58a', 'Đã chốt'], ['#4f67ad', 'Chưa chốt']]} />
            <HorizontalBars rows={sourceRows} />
          </Card>

          <Card title="Top sale chốt" icon={Trophy}>
            <Legend items={[['#43b58a', 'Tỷ lệ chốt (%)'], ['#4f67ad', 'Số khách hàng đã chốt']]} />
            <ReportsBars items={topSaleBarItems} legend={[['#43b58a', 'Tỷ lệ chốt (%)'], ['#4f67ad', 'Số khách hàng đã chốt']]} />
          </Card>
          <Card title="Top doanh thu theo khách hàng" icon={Trophy}>
            <Ranking rows={topCustomerRanking} />
          </Card>
          <Card title="Doanh thu theo nguồn khách">
            <Legend items={sourceLegend} />
            <PieChart donut items={revenueBySourceItems} />
          </Card>
          <Card title="Doanh thu theo nhân viên" icon={Users}>
            <Ranking rows={revenueByStaffRanking} />
          </Card>

          <Card title="Số cuộc gọi theo nhân viên" icon={Phone}>
            <Ranking rows={callsByStaffRanking} />
          </Card>
          <Card title="Khách hàng theo Khu vực" icon={MapPin}>
            <Legend items={[['#43b58a', 'Đã chốt'], ['#4f67ad', 'Chưa chốt']]} />
            <HorizontalBars rows={areaRows} />
          </Card>
          <Card title="Doanh thu theo Khu vực" icon={MapPin}>
            <Legend items={areaLegend} />
            <PieChart donut items={revenueByAreaItems} />
          </Card>
        </div>
      </main>
    </div>
  );
}
