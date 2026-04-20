import {
  Activity,
  BellRing,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Medal,
  TimerReset,
  Trophy,
  Users
} from "lucide-react";

const dashboardStats = [
  {
    label: "Registered Skaters",
    value: "248",
    change: "+14",
    note: "new this month",
    icon: Users,
    iconClass: "bg-[#fff1eb] text-[#f6765e]",
    lineClass: "from-[#f8b39d] to-[#f6765e]",
    points: [24, 28, 30, 33, 35, 38, 42]
  },
  {
    label: "Sessions Today",
    value: "16",
    change: "4",
    note: "still ongoing",
    icon: Activity,
    iconClass: "bg-[#ecf9f8] text-[#53c7c5]",
    lineClass: "from-[#9de2dd] to-[#53c7c5]",
    points: [14, 16, 18, 17, 20, 22, 24]
  },
  {
    label: "Upcoming Events",
    value: "7",
    change: "+2",
    note: "for this quarter",
    icon: Trophy,
    iconClass: "bg-[#eef8f0] text-[#67c07d]",
    lineClass: "from-[#a9ddb7] to-[#67c07d]",
    points: [10, 11, 13, 15, 15, 17, 19]
  },
  {
    label: "Monthly Revenue",
    value: "₹4.8L",
    change: "+9.4%",
    note: "from last month",
    icon: CircleDollarSign,
    iconClass: "bg-[#f3efff] text-[#8e82ff]",
    lineClass: "from-[#c7beff] to-[#8e82ff]",
    points: [22, 24, 26, 29, 28, 32, 35]
  }
];

const upcomingSessions = [
  {
    title: "Speed Skating Elite Batch",
    subtitle: "Kanteerava Rink",
    time: "06:00 AM",
    coach: "Coach Mahesh",
    accent: "bg-[#edf8ef] text-[#4da667]"
  },
  {
    title: "Artistic Freestyle Practice",
    subtitle: "Indoor Arena - Block B",
    time: "04:30 PM",
    coach: "Coach Sneha",
    accent: "bg-[#fff3eb] text-[#f6765e]"
  },
  {
    title: "Beginner Balance Clinic",
    subtitle: "District Camp - Mysuru",
    time: "05:45 PM",
    coach: "Coach Arjun",
    accent: "bg-[#f3efff] text-[#8e82ff]"
  }
];

const activityRows = [
  {
    title: "State meet registrations opened",
    detail: "42 skaters submitted entries in the first hour",
    icon: Medal,
    iconClass: "bg-[#ecf9f8] text-[#53c7c5]",
    time: "10 min ago"
  },
  {
    title: "Track session rescheduled",
    detail: "Evening endurance practice moved due to rain",
    icon: TimerReset,
    iconClass: "bg-[#fff1eb] text-[#f6765e]",
    time: "28 min ago"
  },
  {
    title: "Club ranking updated",
    detail: "Bengaluru North club moved to 2nd position",
    icon: Trophy,
    iconClass: "bg-[#eef8f0] text-[#67c07d]",
    time: "1 hr ago"
  }
];

const disciplineDistribution = [
  { label: "Speed", value: 34, color: "#f6765e" },
  { label: "Artistic", value: 26, color: "#13b5b4" },
  { label: "Inline Freestyle", value: 18, color: "#2fa96d" },
  { label: "Roller Hockey", value: 12, color: "#8e82ff" },
  { label: "Officials & Coaches", value: 10, color: "#f2b94b" }
];

const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const yLabels = ["0", "20", "40", "60", "80"];

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

const StatCard = ({ stat, index }) => {
  const Icon = stat.icon;
  const metricText = stat.change.startsWith("+") ? "text-[#58ae71]" : "text-[#8b7f7b]";

  return (
    <article className="rounded-[24px] border border-white/70 bg-white p-5 shadow-[0_16px_40px_rgba(150,116,104,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(150,116,104,0.14)]">
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

        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconClass}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className={`mt-4 h-10 text-transparent bg-gradient-to-r ${stat.lineClass}`}>
        <Sparkline
          points={stat.points}
          gradientId={`spark-${index}`}
          className="h-full w-full text-current"
        />
      </div>
    </article>
  );
};

const TrainingLoadChart = () => {
  const attendanceArea =
    "M 0 186 C 62 178, 122 172, 180 146 C 236 122, 300 124, 350 138 C 408 154, 460 126, 520 90 L 520 250 L 0 250 Z";
  const performanceArea =
    "M 0 210 C 60 200, 116 188, 180 178 C 240 166, 300 150, 350 142 C 400 136, 460 118, 520 102 L 520 250 L 0 250 Z";
  const attendanceLine =
    "M 0 186 C 62 178, 122 172, 180 146 C 236 122, 300 124, 350 138 C 408 154, 460 126, 520 90";
  const performanceLine =
    "M 0 210 C 60 200, 116 188, 180 178 C 240 166, 300 150, 350 142 C 400 136, 460 118, 520 102";

  return (
    <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(145,110,98,0.14)]">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
          Weekly Training Load
        </h2>
        <p className="mt-1 text-xs text-[#a0918b]">
          Attendance and performance intensity across the week
        </p>
      </div>

      <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
        <div className="flex h-[250px] flex-col justify-between pb-7 text-[11px] text-[#b3a5a0]">
          {[...yLabels].reverse().map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        <div>
          <svg viewBox="0 0 520 250" className="h-[250px] w-full">
            <defs>
              <linearGradient id="attendanceArea" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#53c7c5" stopOpacity="0.26" />
                <stop offset="100%" stopColor="#53c7c5" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="performanceArea" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#f6765e" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f6765e" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {[40, 90, 140, 190].map((y) => (
              <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#f2e6e0" strokeDasharray="4 6" />
            ))}

            <path d={attendanceArea} fill="url(#attendanceArea)" />
            <path d={performanceArea} fill="url(#performanceArea)" />
            <path
              d={attendanceLine}
              fill="none"
              stroke="#53c7c5"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d={performanceLine}
              fill="none"
              stroke="#f6765e"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>

          <div className="mt-1 grid grid-cols-7 text-center text-[11px] text-[#b1a29d]">
            {weekLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const DisciplineDonut = () => {
  const gradient = `conic-gradient(${disciplineDistribution
    .map((item, index) => {
      const previous = disciplineDistribution
        .slice(0, index)
        .reduce((sum, current) => sum + current.value, 0);
      return `${item.color} ${previous}% ${previous + item.value}%`;
    })
    .join(", ")})`;

  return (
    <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(145,110,98,0.14)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
          Discipline Split
        </h2>
        <p className="mt-1 text-xs text-[#a0918b]">Current registration by skating discipline</p>
      </div>

      <div className="flex justify-center">
        <div
          className="relative flex h-48 w-48 items-center justify-center rounded-full"
          style={{ background: gradient }}
        >
          <div className="flex h-[110px] w-[110px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(239,226,220,0.9)]">
            <span className="text-3xl font-semibold tracking-[-0.05em] text-[#2f2829]">248</span>
            <span className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#ab9d98]">
              Skaters
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {disciplineDistribution.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
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

export const AdminDashboard = () => {
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white px-6 py-6 shadow-[0_16px_44px_rgba(145,110,98,0.08)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#f6765e]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-16 h-32 w-32 rounded-full bg-[#53c7c5]/10 blur-2xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d09987]">
          Dashboard
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2829] md:text-[2.3rem]">
              Karnataka Skating Dashboard
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-[#8f827e]">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#53c7c5]" />
              Welcome back, Coach Admin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#efe2dc] bg-[#faf5f2] text-[#8f827e] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
              <Clock3 size={18} />
            </button>
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#efe2dc] bg-[#faf5f2] text-[#8f827e] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
              <BellRing size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.85fr)]">
        <TrainingLoadChart />
        <DisciplineDonut />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(145,110,98,0.14)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
                Upcoming Sessions
              </h2>
              <p className="mt-1 text-xs text-[#a0918b]">
                Today&apos;s training and coaching schedule
              </p>
            </div>
            <button className="rounded-2xl border border-[#efe2dc] bg-[#faf5f2] px-4 py-2 text-xs font-medium text-[#6f6462] transition hover:bg-white">
              View schedule
            </button>
          </div>

          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.title}
                className="grid gap-3 rounded-[22px] border border-[#f1e5df] bg-[#fffaf8] p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white lg:grid-cols-[minmax(0,1fr)_120px_130px]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#2f2829]">{session.title}</p>
                  <p className="mt-1 text-sm text-[#8c7e79]">{session.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6e6361]">
                  <CalendarDays size={16} className="text-[#b4a49f]" />
                  {session.time}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-[#6e6361]">{session.coach}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${session.accent}`}
                  >
                    Ready
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_18px_48px_rgba(145,110,98,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_56px_rgba(145,110,98,0.14)]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#2f2829]">
              Recent Activity
            </h2>
            <p className="mt-1 text-xs text-[#a0918b]">
              Latest updates from clubs, camps, and events
            </p>
          </div>

          <div className="space-y-4">
            {activityRows.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-[22px] bg-[#fcf7f4] p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.iconClass}`}
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
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
