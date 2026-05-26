import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  MapPin,
  Medal,
  TimerReset,
  Trophy,
  UserPlus,
  Users
} from "lucide-react";
import { Skeleton } from "@mui/material";
import { stateApi } from "@/api/state-api";
import { canShowDashboardModule, filterDashboardStats } from "@/lib/dashboard-modules";

const STAT_META = {
  registeredSkaters: {
    icon: Users,
    iconClass: "bg-[#fff1eb] text-[#f6765e]",
    lineClass: "from-[#f8b39d] to-[#f6765e]"
  },
  totalClubs: {
    icon: Activity,
    iconClass: "bg-[#ecf9f8] text-[#53c7c5]",
    lineClass: "from-[#9de2dd] to-[#53c7c5]"
  },
  upcomingEvents: {
    icon: Trophy,
    iconClass: "bg-[#eef8f0] text-[#67c07d]",
    lineClass: "from-[#a9ddb7] to-[#67c07d]"
  },
  totalDistricts: {
    icon: MapPin,
    iconClass: "bg-[#f3efff] text-[#8e82ff]",
    lineClass: "from-[#c7beff] to-[#8e82ff]"
  }
};

const DEFAULT_SPARKLINE = [24, 28, 30, 33, 35, 38, 42];

const STAT_ROUTES = {
  registeredSkaters: "/skaters",
  totalClubs: "/clubs",
  upcomingEvents: "/events/detail",
  totalDistricts: "/districts"
};

const CLICKABLE_CARD_CLASS =
  "w-full cursor-pointer text-left transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(150,116,104,0.14)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6765e]/40";

const staggerStyle = (index, stepMs = 90) => ({
  animationDelay: `${index * stepMs}ms`,
});

const sparklinePath = (points) =>
  points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - point;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

const Sparkline = ({ points, gradientId, className }) => {
  const line = sparklinePath(points);

  return (
    <svg viewBox="0 0 100 56" className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.88" />
        </linearGradient>
      </defs>
      <path
        d={line}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

const StatCard = ({ stat, index, sparklinePoints, onNavigate }) => {
  const meta = STAT_META[stat.key] || STAT_META.registeredSkaters;
  const Icon = meta.icon;
  const metricText = String(stat.change || "").startsWith("+")
    ? "text-[#58ae71]"
    : "text-[#8b7f7b]";
  const to = STAT_ROUTES[stat.key];

  return (
    <button
      type="button"
      onClick={() => to && onNavigate(to)}
      disabled={!to}
      style={staggerStyle(index, 80)}
      className={`dashboard-stat-card group rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_16px_40px_rgba(150,116,104,0.08)] ${to ? CLICKABLE_CARD_CLASS : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#9d8f8a]">{stat.label}</p>
          <p className="mt-2 text-[2rem] font-semibold tracking-[-0.05em] text-[#2f2829]">
            {stat.value}
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span className={`font-semibold ${metricText}`}>{stat.change}</span>
            <span className="text-[#9d8f8a]">{stat.note}</span>
          </div>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${meta.iconClass}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className={`mt-4 h-10 text-transparent bg-gradient-to-r ${meta.lineClass}`}>
        <Sparkline
          points={sparklinePoints}
          gradientId={`spark-${stat.key}-${index}`}
          className="h-full w-full text-current"
        />
      </div>
    </button>
  );
};

const DashboardPanel = ({ to, onNavigate, children, className = "", delay = 0 }) => (
  <button
    type="button"
    onClick={() => onNavigate(to)}
    style={staggerStyle(delay, 120)}
    className={`dashboard-panel block h-full w-full ${CLICKABLE_CARD_CLASS} ${className}`}
  >
    {children}
  </button>
);

const CHART_HEIGHT = 168;
const CHART_WIDTH = 520;

const padWeeklySeries = (series, length) => {
  const padded = [...series];
  while (padded.length < length) {
    padded.push({ count: 0 });
  }
  return padded.slice(0, length);
};

const sumSeries = (series) => series.reduce((total, item) => total + (item.count || 0), 0);

const computeChartMax = (skaterSeries, reportSeries) => {
  const peak = Math.max(
    ...skaterSeries.map((item) => item.count),
    ...reportSeries.map((item) => item.count),
    1
  );
  if (peak <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(peak));
  return Math.ceil(peak / magnitude) * magnitude;
};

const buildAreaPath = (series, yMax, height = CHART_HEIGHT, width = CHART_WIDTH) => {
  if (!series?.length) {
    return { line: "", area: "", points: [] };
  }

  const count = series.length;

  const points = series.map((item, index) => {
    const x = ((index + 0.5) / count) * width;
    const y = height - (item.count / yMax) * (height - 48) - 24;
    return { x, y, count: item.count };
  });

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const firstX = (0.5 / count) * width;
  const lastX = ((count - 0.5) / count) * width;
  const area = `${line} L ${lastX} ${height} L ${firstX} ${height} Z`;

  return { line, area, points };
};

const ChartLegendItem = ({ color, label, description, icon: Icon }) => (
  <div className="flex min-w-[140px] flex-1 items-start gap-2 rounded-xl border border-[#f0e3dd] bg-[#fffcfa] px-2.5 py-2">
    <span
      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <Icon size={16} />
    </span>
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-xs font-semibold text-[#2f2829]">{label}</p>
      </div>
      <p className="mt-0.5 text-[11px] leading-relaxed text-[#9a8b86]">{description}</p>
    </div>
  </div>
);

const TrainingLoadChart = ({ weeklyOverview }) => {
  const skaterSeries = weeklyOverview?.skaterRegistrations || [];
  const reportSeries = weeklyOverview?.reportsFiled || [];
  const labels = weeklyOverview?.labels?.length
    ? weeklyOverview.labels
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const [hoveredDay, setHoveredDay] = useState(null);

  const dayCount = Math.max(skaterSeries.length, reportSeries.length, labels.length, 7);
  const normalizedSkaterSeries = padWeeklySeries(skaterSeries, dayCount);
  const normalizedReportSeries = padWeeklySeries(reportSeries, dayCount);
  const normalizedLabels = [...labels];
  while (normalizedLabels.length < dayCount) {
    normalizedLabels.push("");
  }
  normalizedLabels.splice(dayCount);

  const chartMax = useMemo(
    () => computeChartMax(normalizedSkaterSeries, normalizedReportSeries),
    [normalizedSkaterSeries, normalizedReportSeries]
  );

  const skaterPaths = useMemo(
    () => buildAreaPath(normalizedSkaterSeries, chartMax),
    [normalizedSkaterSeries, chartMax]
  );
  const reportPaths = useMemo(
    () => buildAreaPath(normalizedReportSeries, chartMax),
    [normalizedReportSeries, chartMax]
  );

  const yLabels = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, index) =>
      String(Math.round((chartMax / steps) * (steps - index)))
    );
  }, [chartMax]);

  const totalSkaters = sumSeries(normalizedSkaterSeries);
  const totalReports = sumSeries(normalizedReportSeries);

  const gridYs = [0.25, 0.5, 0.75].map((ratio) => 24 + (CHART_HEIGHT - 48) * ratio);

  const hoveredPoint =
    hoveredDay != null
      ? {
          label: normalizedLabels[hoveredDay],
          skaters: normalizedSkaterSeries[hoveredDay]?.count ?? 0,
          reports: normalizedReportSeries[hoveredDay]?.count ?? 0,
          x: skaterPaths.points[hoveredDay]?.x ?? 0
        }
      : null;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-white via-[#fffcfa] to-[#f8f4f2] p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)]">
    <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-[#14b8a6]/10 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-16 left-10 h-36 w-36 rounded-full bg-[#f97316]/10 blur-3xl" />

    <div className="relative z-10 mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
          Weekly Overview
        </h2>
        <p className="mt-1 text-xs text-[#a0918b]">
          Skater registrations and reports this week
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div
          className="dashboard-metric-pill rounded-2xl border border-[#dff7f6] bg-[#effcfb] px-3 py-2"
          style={staggerStyle(0, 100)}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#14b8a6]">
            Skaters
          </p>
          <p className="text-lg font-bold leading-tight text-[#111827]">{totalSkaters}</p>
        </div>

        <div
          className="dashboard-metric-pill rounded-2xl border border-[#ffe4dc] bg-[#fff5f2] px-3 py-2"
          style={staggerStyle(1, 100)}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#f97316]">
            Reports
          </p>
          <p className="text-lg font-bold leading-tight text-[#111827]">{totalReports}</p>
        </div>
      </div>
    </div>

    <div className="relative z-10 mb-3 flex flex-wrap gap-2">
      <div className="dashboard-metric-pill" style={staggerStyle(0, 100)}>
        <ChartLegendItem
          color="#14b8a6"
          icon={UserPlus}
          label="Skater Registrations"
          description="Daily sign-ups"
        />
      </div>

      <div className="dashboard-metric-pill" style={staggerStyle(1, 100)}>
        <ChartLegendItem
          color="#f97316"
          icon={ClipboardList}
          label="Reports Filed"
          description="Daily submissions"
        />
      </div>
    </div>

    <div className="relative z-10 flex min-h-0 flex-1 w-full gap-3">
      <div
        className="flex shrink-0 flex-col justify-between text-[10px] font-semibold text-[#9ca3af]"
        style={{ height: CHART_HEIGHT }}
      >
        {yLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
  
      {/* Graph */}
      <div className="relative flex-1">
        {/* Tooltip */}
        {hoveredPoint && (
          <div
            className="dashboard-enter absolute z-20 min-w-[160px] -translate-x-1/2 rounded-2xl border border-[#f1f5f9] bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md"
            style={{
              left: `${(hoveredPoint.x / CHART_WIDTH) * 100}%`,
              top: 10,
            }}
          >
            <p className="text-sm font-bold text-[#111827]">
              {hoveredPoint.label}
            </p>
  
            <div className="mt-2 space-y-1">
              <p className="text-xs text-[#14b8a6]">
                Skaters:
                <span className="ml-1 font-bold">
                  {hoveredPoint.skaters}
                </span>
              </p>
  
              <p className="text-xs text-[#f97316]">
                Reports:
                <span className="ml-1 font-bold">
                  {hoveredPoint.reports}
                </span>
              </p>
            </div>
          </div>
        )}
  
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="dashboard-chart-grid w-full"
          style={{ height: CHART_HEIGHT }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="skaterAreaGrad"
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#14b8a6"
                stopOpacity="0.35"
              />
              <stop
                offset="100%"
                stopColor="#14b8a6"
                stopOpacity="0"
              />
            </linearGradient>
  
            <linearGradient
              id="reportAreaGrad"
              x1="0%"
              x2="0%"
              y1="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor="#f97316"
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor="#f97316"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
  
          {/* Grid */}
          {gridYs.map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2={CHART_WIDTH}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="5 5"
            />
          ))}
  
          {/* Bottom Axis */}
          <line
            x1="0"
            y1={CHART_HEIGHT - 24}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT - 24}
            stroke="#d1d5db"
          />
  
          {/* Hover Line */}
          {hoveredDay != null && skaterPaths.points[hoveredDay] && (
            <line
              x1={skaterPaths.points[hoveredDay].x}
              y1={24}
              x2={skaterPaths.points[hoveredDay].x}
              y2={CHART_HEIGHT - 24}
              stroke="#cbd5e1"
              strokeDasharray="4 4"
            />
          )}
  
          {/* Areas */}
          <path
            d={skaterPaths.area}
            fill="url(#skaterAreaGrad)"
            className="dashboard-chart-area"
            style={staggerStyle(0, 80)}
          />

          <path
            d={reportPaths.area}
            fill="url(#reportAreaGrad)"
            className="dashboard-chart-area"
            style={staggerStyle(1, 80)}
          />

          {/* Lines */}
          <path
            d={skaterPaths.line}
            fill="none"
            stroke="#14b8a6"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="dashboard-chart-line"
            style={staggerStyle(2, 80)}
          />

          <path
            d={reportPaths.line}
            fill="none"
            stroke="#f97316"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="1"
            className="dashboard-chart-line"
            style={{ ...staggerStyle(3, 80), animationDelay: "0.35s" }}
          />

          {/* Dots */}
          {skaterPaths.points.map((point, index) => (
            <circle
              key={`skater-${index}`}
              cx={point.x}
              cy={point.y}
              r={hoveredDay === index ? 7 : 5}
              fill="#14b8a6"
              stroke="#fff"
              strokeWidth="3"
              className="dashboard-chart-dot transition-all duration-200"
              style={{ animationDelay: `${0.55 + index * 0.07}s` }}
            />
          ))}

          {reportPaths.points.map((point, index) => (
            <circle
              key={`report-${index}`}
              cx={point.x}
              cy={point.y}
              r={hoveredDay === index ? 7 : 5}
              fill="#f97316"
              stroke="#fff"
              strokeWidth="3"
              className="dashboard-chart-dot transition-all duration-200"
              style={{ animationDelay: `${0.75 + index * 0.07}s` }}
            />
          ))}
        </svg>
  
        {/* Bottom Labels */}
        <div
          className="mt-2 grid gap-1 text-center"
          style={{
            gridTemplateColumns: `repeat(${normalizedLabels.length}, minmax(0, 1fr))`,
          }}
        >
          {normalizedLabels.map((label, index) => (
            <button
              key={`${label}-${index}`}
              type="button"
              onMouseEnter={() => setHoveredDay(index)}
              onMouseLeave={() => setHoveredDay(null)}
              onFocus={() => setHoveredDay(index)}
              onBlur={() => setHoveredDay(null)}
              className={`rounded-lg py-1 text-[10px] font-semibold transition-all duration-200 ${
                hoveredDay === index
                  ? "bg-[#fff1eb] text-[#f97316]"
                  : "text-[#6b7280] hover:bg-[#f9fafb]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

const DisciplineDonut = ({ distribution, total }) => {
  const items = distribution?.length
    ? distribution
    : [{ label: "No data", value: 100, color: "#efe2dc" }];

  const gradient = `conic-gradient(${items
    .map((item, index) => {
      const previous = items.slice(0, index).reduce((sum, current) => sum + current.value, 0);
      return `${item.color} ${previous}% ${previous + item.value}%`;
    })
    .join(", ")})`;

  return (
    <div className="flex h-full w-full flex-col rounded-[28px] border border-white/70 bg-gradient-to-b from-white to-[#fffaf8] p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)]">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
          Discipline Split
        </h2>
        <p className="mt-1 text-xs text-[#a0918b]">Active skaters by discipline</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="dashboard-donut-ring relative flex h-40 w-40 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_rgba(239,226,220,0.5)]"
          style={{ background: gradient }}
        >
          <div className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(239,226,220,0.9)]">
            <span className="text-2xl font-semibold tracking-[-0.05em] text-[#2f2829]">
              {total}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#ab9d98]">
              Skaters
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="dashboard-list-item flex items-center justify-between gap-3 rounded-xl px-1 py-0.5 text-sm transition-colors hover:bg-[#fff6f2]"
            style={staggerStyle(index, 60)}
          >
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[#736866]">{item.label}</span>
            </div>
            <span className="font-medium text-[#2f2829]">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const activityIconFor = (type) => {
  if (type === "event") return Trophy;
  if (type === "report") return Medal;
  return TimerReset;
};

const activityClassFor = (type) => {
  if (type === "event") return "bg-[#eef8f0] text-[#67c07d]";
  if (type === "report") return "bg-[#ecf9f8] text-[#53c7c5]";
  return "bg-[#fff1eb] text-[#f6765e]";
};

const getEventStatusLabel = (status) => {
  switch (status) {
    case "coming_soon":
      return "Coming Soon";
    case "active":
      return "Active";
    case "cancelled":
      return "Cancelled";
    case "completed":
      return "Completed";
    default:
      return String(status || "Unknown")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

const getEventStatusBadgeClass = (status) => {
  switch (status) {
    case "active":
      return "bg-[#edf8ef] text-[#4da667]";
    case "coming_soon":
      return "bg-[#fff6e8] text-[#d97706]";
    case "cancelled":
      return "bg-[#fef2f2] text-[#dc2626]";
    case "completed":
      return "bg-[#eff6ff] text-[#2563eb]";
    default:
      return "bg-[#f5f0ee] text-[#756968]";
  }
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const goTo = (path) => navigate(path);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await stateApi.getDashboard();
        if (!response?.success) {
          throw new Error(response?.message || "Failed to load dashboard");
        }
        if (!cancelled) {
          setDashboard(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const role = dashboard?.user?.role;
  const allowedModule = dashboard?.user?.allowedModule;
  const normalizedRole = String(role || "").toLowerCase();

  const visibleStats = useMemo(
    () => filterDashboardStats(dashboard?.stats, role, allowedModule),
    [dashboard?.stats, role, allowedModule]
  );

  const showSkaters = canShowDashboardModule(role, allowedModule, "Skaters");
  const showEvents = canShowDashboardModule(role, allowedModule, "Events");
  const showReports = canShowDashboardModule(role, allowedModule, "Reports");

  const greetingName = dashboard?.user?.fullName || "Admin";
  const greetingRole = normalizedRole === "state" ? "State Official" : "State Admin";

  const sparklines = dashboard?.weeklyOverview || {};

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: "28px" }} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} variant="rounded" height={160} sx={{ borderRadius: "24px" }} />
          ))}
        </div>
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: "28px" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-[#f5d5c8] bg-[#fff7f4] px-6 py-8 text-center">
        <p className="text-sm font-medium text-[#e85d3f]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="dashboard-enter relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-r from-white via-[#fffefd] to-[#fff8f5] px-6 py-6 shadow-[0_16px_44px_rgba(145,110,98,0.08)]">
        <div className="dashboard-hero-glow pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#f6765e]/12 blur-2xl" />
        <div className="dashboard-hero-glow pointer-events-none absolute -bottom-10 left-16 h-32 w-32 rounded-full bg-[#53c7c5]/12 blur-2xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d09987]">
          Dashboard
        </p>
        <div className="mt-3">
          <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2829] md:text-[2.3rem]">
            Karnataka Skating Dashboard
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#8f827e]">
            <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#53c7c5]" />
            Welcome back, {greetingName} · {greetingRole}
          </p>
        </div>
      </section>

      {visibleStats.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {visibleStats.map((stat, index) => (
            <StatCard
              key={stat.key}
              stat={stat}
              index={index}
              onNavigate={goTo}
              sparklinePoints={
                stat.key === "registeredSkaters"
                  ? sparklines.skaterSparkline || DEFAULT_SPARKLINE
                  : stat.key === "totalDistricts"
                    ? sparklines.reportSparkline || DEFAULT_SPARKLINE
                    : DEFAULT_SPARKLINE
              }
            />
          ))}
        </section>
      )}

      {(showSkaters || showReports) && (
        <section
          className={`grid items-stretch gap-5 ${showSkaters ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]" : ""}`}
        >
          <DashboardPanel to={showSkaters ? "/skaters" : "/reports/school"} onNavigate={goTo} delay={0}>
            <TrainingLoadChart weeklyOverview={dashboard?.weeklyOverview} />
          </DashboardPanel>
          {showSkaters && (
            <DashboardPanel to="/skaters" onNavigate={goTo} delay={1}>
              <DisciplineDonut
                distribution={dashboard?.disciplineDistribution}
                total={dashboard?.disciplineTotal || dashboard?.summary?.totalSkaters || 0}
              />
            </DashboardPanel>
          )}
        </section>
      )}

      {(showEvents || showReports) && (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          {showEvents && (
            <DashboardPanel
              to="/events/detail"
              onNavigate={goTo}
              delay={0}
              className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)] hover:shadow-[0_26px_56px_rgba(145,110,98,0.14)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
                    Upcoming Events
                  </h2>
                  <p className="mt-1 text-xs text-[#a0918b]">Events scheduled from today onward</p>
                </div>
              </div>

              <div className="space-y-3">
                {(dashboard?.upcomingSessions || []).length === 0 ? (
                  <p className="text-sm text-[#b19f99]">No upcoming events scheduled.</p>
                ) : (
                  dashboard.upcomingSessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="dashboard-list-item grid gap-3 rounded-[22px] border border-[#f1e5df] bg-[#fffaf8] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#f6765e]/20 hover:bg-white hover:shadow-md lg:grid-cols-[minmax(0,1fr)_120px_130px]"
                      style={staggerStyle(index, 70)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#2f2829]">{session.title}</p>
                        <p className="mt-1 text-sm text-[#8c7e79]">{session.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#6e6361]">
                        <CalendarDays size={16} className="text-[#b4a49f]" />
                        {session.time || "TBA"}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-[#6e6361]">{session.coach}</span>
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getEventStatusBadgeClass(session.status)}`}
                        >
                          {getEventStatusLabel(session.status)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DashboardPanel>
          )}

          {showReports && (
            <DashboardPanel
              to="/complains"
              onNavigate={goTo}
              delay={showEvents ? 1 : 0}
              className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)] hover:shadow-[0_26px_56px_rgba(145,110,98,0.14)]"
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
                  Recent Activity
                </h2>
                <p className="mt-1 text-xs text-[#a0918b]">
                  Latest reports and events across Karnataka
                </p>
              </div>

              <div className="space-y-4">
                {(dashboard?.recentActivity || []).length === 0 ? (
                  <p className="text-sm text-[#b19f99]">No recent activity yet.</p>
                ) : (
                  dashboard.recentActivity.map((item, index) => {
                    const Icon = activityIconFor(item.type);

                    return (
                      <div
                        key={item.id}
                        className="dashboard-list-item flex items-start gap-4 rounded-[22px] bg-[#fcf7f4] p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                        style={staggerStyle(index, 65)}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${activityClassFor(item.type)}`}
                        >
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-[#2f2829]">{item.title}</p>
                            <span className="text-[11px] text-[#b09f99]">{item.time}</span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-[#8d7f7b]">{item.detail}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </DashboardPanel>
          )}
        </section>
      )}
    </div>
  );
};
