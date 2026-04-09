import { motion } from "framer-motion";
import { Users, AlertCircle, Activity, CheckCircle, TrendingUp } from "lucide-react";
import {
  useGetDashboardStats,
  useGetDashboardActivity,
  useGetRiskBreakdown,
  getGetDashboardStatsQueryKey,
  getGetDashboardActivityQueryKey,
  getGetRiskBreakdownQueryKey,
} from "@workspace/api-client-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useI18n } from "@/lib/i18n";

const COLORS = {
  emergency: "#EF4444",
  urgent: "#F59E0B",
  routine: "#22C55E",
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { t } = useI18n();

  const { data: stats, isLoading: statsLoading, isError: statsError, error: statsErr } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey(), retry: 1 },
  });

  const { data: activity, isLoading: activityLoading } = useGetDashboardActivity({
    query: { queryKey: getGetDashboardActivityQueryKey(), retry: 1 },
  });

  const { data: riskBreakdown } = useGetRiskBreakdown({
    query: { queryKey: getGetRiskBreakdownQueryKey(), retry: 1 },
  });

  const pieData = riskBreakdown?.map((r) => ({
    name: r.level.charAt(0).toUpperCase() + r.level.slice(1),
    value: r.count,
    color: COLORS[r.level as keyof typeof COLORS] || "#9CA3AF",
  })) || [];

  const statCards = [
    {
      key: "patients",
      label: t("dash.stats.patients"),
      value: stats?.total_patients ?? "—",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      key: "active",
      label: t("dash.stats.active"),
      value: stats?.active_cases ?? "—",
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      key: "alerts",
      label: t("dash.stats.alerts"),
      value: stats?.high_risk_alerts ?? "—",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      key: "resolved",
      label: t("dash.stats.resolved"),
      value: stats?.resolved_cases ?? "—",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const triageBadge = (level: string) => {
    const config = {
      emergency: "bg-red-100 text-red-700 border-red-200",
      urgent: "bg-amber-100 text-amber-700 border-amber-200",
      routine: "bg-green-100 text-green-700 border-green-200",
    }[level] || "bg-secondary text-muted-foreground border-border";
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config}`;
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("dash.title")}</h1>
          <p className="mt-2 text-muted-foreground">Real-time overview of patient cases and AI assessments.</p>
        </motion.div>

        {statsError && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">Could not load dashboard</p>
            <p className="mt-1">
              {statsErr instanceof Error ? statsErr.message : "API unreachable."} Run{" "}
              <code className="rounded bg-background px-1 py-0.5 text-xs">pnpm run dev:api</code> in the project root.
              Zeros below may appear if the database is empty or unavailable.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.key}
                variants={item}
                data-testid={`stat-card-${card.key}`}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {statsLoading ? (
                    <div className="h-8 w-12 bg-secondary animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">{card.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Confidence indicator */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">Avg AI Confidence</h2>
              </div>
              <div className="text-4xl font-bold text-primary">
                {stats.avg_confidence ? Math.round(stats.avg_confidence * 100) : 0}%
              </div>
              <div className="mt-3 bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-700"
                  style={{ width: `${stats.avg_confidence ? Math.round(stats.avg_confidence * 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Based on all assessments</p>
            </motion.div>
          )}

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm"
            >
              <h2 className="font-semibold text-foreground mb-4">Risk Level Distribution</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value + " cases", name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="overflow-x-auto">
            {activityLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-secondary animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide bg-secondary/50">
                    <th className="px-6 py-3 font-medium">Patient</th>
                    <th className="px-6 py-3 font-medium">Action</th>
                    <th className="px-6 py-3 font-medium">Triage</th>
                    <th className="px-6 py-3 font-medium">Diagnosis</th>
                    <th className="px-6 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {activity?.map((a) => (
                    <tr key={a.id} data-testid={`activity-row-${a.id}`} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground text-sm">{a.patient_name}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">{a.action}</td>
                      <td className="px-6 py-4">
                        <span className={triageBadge(a.triage_level)}>
                          {a.triage_level.charAt(0).toUpperCase() + a.triage_level.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm max-w-[200px] truncate">{a.diagnosis}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
