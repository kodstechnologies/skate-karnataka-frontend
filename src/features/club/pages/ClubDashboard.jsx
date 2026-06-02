import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "@mui/material";
import { CalendarDays, Image, Trophy, Users } from "lucide-react";
import { MemberAddMenuButton } from "@/components/members/MemberAddMenuButton";
import { clubPortalApi } from "@/api/club-portal-api";
import { useAuthStore } from "@/features/auth/store/auth-store";

const StatCard = ({ label, value, icon: Icon, iconClass }) => (
  <div className="rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_12px_32px_rgba(145,110,98,0.08)]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c4a498]">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#2f2829]">{value}</p>
      </div>
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
  </div>
);

export const ClubDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await clubPortalApi.getDashboard();
        if (!cancelled) {
          setData(response?.data ?? response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || err.message || "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const clubName = data?.clubName || user?.name || "Club";
  const greetingName = user?.currentMember?.fullName || user?.fullName || "Member";

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton variant="rounded" height={140} sx={{ borderRadius: "28px" }} />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} variant="rounded" height={120} sx={{ borderRadius: "24px" }} />
          ))}
        </div>
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
      <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-r from-white via-[#fffefd] to-[#fff8f5] px-6 py-6 shadow-[0_16px_44px_rgba(145,110,98,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#d09987]">
          Club Dashboard
        </p>
        <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[#2f2829] md:text-[2.2rem]">
          {clubName}
        </h1>
        <p className="mt-2 text-sm text-[#8f827e]">Welcome back, {greetingName}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Registered skaters"
          value={data?.totalSkaters ?? 0}
          icon={Users}
          iconClass="bg-[#fff1eb] text-[#f6765e]"
        />
        <StatCard
          label="Championships"
          value={data?.championships ?? 0}
          icon={Trophy}
          iconClass="bg-[#eef8f0] text-[#67c07d]"
        />
        <StatCard
          label="Rank"
          value={data?.rank ?? "-"}
          icon={Trophy}
          iconClass="bg-[#f3efff] text-[#8e82ff]"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link
          to="/club/events"
          className="flex items-center gap-4 rounded-[24px] border border-[#efe2dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ecf9f8] text-[#53c7c5]">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-[#2f2829]">Club events</p>
            <p className="text-sm text-[#8f827e]">View and manage your club events</p>
          </div>
        </Link>
        <Link
          to="/club/media"
          className="flex items-center gap-4 rounded-[24px] border border-[#efe2dc] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f7f5] text-[#00897b]">
            <Image className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-[#2f2829]">Club media</p>
            <p className="text-sm text-[#8f827e]">Upload photos and videos for approval</p>
          </div>
        </Link>
        <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-[#efe2dc] bg-white p-5 shadow-[0_12px_32px_rgba(145,110,98,0.06)]">
          <div>
            <p className="font-semibold text-[#2f2829]">Club members</p>
            <p className="mt-1 text-sm text-[#8f827e]">
              Add one member or import many from Excel
            </p>
          </div>
          <MemberAddMenuButton
            label="Add club member"
            singleTo="/club/members/create"
            bulkTo="/club/members/bulk"
            sx={{
              alignSelf: "flex-start",
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 700,
              backgroundColor: "#f6765e",
              "&:hover": { backgroundColor: "#ea6b54" }
            }}
          />
        </div>
      </section>

      {Array.isArray(data?.latestSkaters) && data.latestSkaters.length > 0 && (
        <section className="rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_12px_32px_rgba(145,110,98,0.06)]">
          <h2 className="text-lg font-semibold text-[#2f2829]">Latest skaters</h2>
          <ul className="mt-4 divide-y divide-[#f3ebe6]">
            {data.latestSkaters.map((skater) => (
              <li
                key={skater.krsaId || skater.name}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium text-[#2f2829]">{skater.name || "Skater"}</span>
                <span className="text-[#9b8d88]">{skater.krsaId || ""}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
