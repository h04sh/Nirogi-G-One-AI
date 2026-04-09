import { motion } from "framer-motion";
import { FileText, Download, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import {
  useGetReports,
  getGetReportsQueryKey,
} from "@workspace/api-client-react";
import { useI18n } from "@/lib/i18n";

const triageConfig = {
  routine: {
    label: "Routine",
    color: "text-green-700",
    bg: "bg-green-100",
    border: "border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  urgent: {
    label: "Urgent",
    color: "text-amber-700",
    bg: "bg-amber-100",
    border: "border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
  emergency: {
    label: "Emergency",
    color: "text-red-700",
    bg: "bg-red-100",
    border: "border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Reports() {
  const { t } = useI18n();
  const { data: reports, isLoading, isError, error, isFetching } = useGetReports({
    query: { queryKey: getGetReportsQueryKey(), retry: 1 },
  });

  const handleDownload = (id: string, name: string) => {
    window.open(`/api/reports/${id}/pdf`, "_blank");
  };

  const emergencyReports = reports?.filter((r) => r.triage_level === "emergency") || [];
  const urgentReports = reports?.filter((r) => r.triage_level === "urgent") || [];
  const routineReports = reports?.filter((r) => r.triage_level === "routine") || [];

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{t("rep.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {isLoading || isFetching
              ? "Loading reports..."
              : isError
                ? "Could not load reports."
                : `${reports?.length ?? 0} total reports`}{" "}
            — organized by triage priority.
          </p>
        </motion.div>

        {isError && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <p className="font-medium">Connection or server error</p>
            <p className="mt-1 text-destructive/90">
              {error instanceof Error ? error.message : "Request failed."} Start the API with{" "}
              <code className="rounded bg-background px-1 py-0.5 text-xs">pnpm run dev:api</code> (port 3001). For saved
              reports, run PostgreSQL and <code className="rounded bg-background px-1 py-0.5 text-xs">pnpm run db:push</code>
              .
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 h-48 animate-pulse">
                <div className="h-4 bg-secondary rounded w-3/4 mb-3" />
                <div className="h-3 bg-secondary rounded w-1/2 mb-6" />
                <div className="h-3 bg-secondary rounded w-full mb-2" />
                <div className="h-3 bg-secondary rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Emergency Section */}
            {emergencyReports.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="font-semibold text-red-700">Emergency Cases ({emergencyReports.length})</h2>
                </div>
                <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {emergencyReports.map((report) => (
                    <ReportCard key={report.id} report={report} onDownload={handleDownload} downloadLabel={t("rep.download")} />
                  ))}
                </motion.div>
              </motion.section>
            )}

            {/* Urgent Section */}
            {urgentReports.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h2 className="font-semibold text-amber-700">Urgent Cases ({urgentReports.length})</h2>
                </div>
                <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {urgentReports.map((report) => (
                    <ReportCard key={report.id} report={report} onDownload={handleDownload} downloadLabel={t("rep.download")} />
                  ))}
                </motion.div>
              </motion.section>
            )}

            {/* Routine Section */}
            {routineReports.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h2 className="font-semibold text-green-700">Routine Cases ({routineReports.length})</h2>
                </div>
                <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {routineReports.map((report) => (
                    <ReportCard key={report.id} report={report} onDownload={handleDownload} downloadLabel={t("rep.download")} />
                  ))}
                </motion.div>
              </motion.section>
            )}

            {!reports?.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-muted-foreground"
              >
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No reports yet</p>
                <p className="text-sm mt-1">Run a diagnosis to create your first report.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ReportCardProps {
  report: {
    id: string;
    patient_name: string;
    age?: number | null;
    gender?: string | null;
    symptoms: string;
    diagnosis: string;
    triage_level: string;
    confidence: number;
    created_at: string;
    notes?: string | null;
  };
  onDownload: (id: string, name: string) => void;
  downloadLabel: string;
}

function ReportCard({ report, onDownload, downloadLabel }: ReportCardProps) {
  const triageKey = (report.triage_level as keyof typeof triageConfig) in triageConfig
    ? (report.triage_level as keyof typeof triageConfig)
    : "routine";
  const config = triageConfig[triageKey];
  const Icon = config.icon;

  return (
    <motion.div
      variants={cardVariant}
      data-testid={`report-card-${report.id}`}
      className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{report.patient_name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {report.age ? `${report.age} yrs` : ""}{report.age && report.gender ? " · " : ""}{report.gender}
          </p>
        </div>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ml-2 ${config.bg} ${config.color} ${config.border}`}>
          <Icon className={`w-3 h-3 ${config.iconColor}`} />
          {config.label}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Symptoms</p>
        <p className="text-sm text-foreground line-clamp-2">{report.symptoms}</p>
      </div>

      <div className="mb-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Diagnosis</p>
        <p className="text-sm font-medium text-foreground">{report.diagnosis}</p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <div className="text-xs text-muted-foreground">Confidence</div>
          <div className="text-xs font-semibold text-primary">{Math.round(report.confidence * 100)}%</div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {new Date(report.created_at).toLocaleDateString()}
        </div>
      </div>

      <button
        data-testid={`button-download-${report.id}`}
        onClick={() => onDownload(report.id, report.patient_name)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-primary/20 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
      >
        <Download className="w-3.5 h-3.5" />
        {downloadLabel}
      </button>
    </motion.div>
  );
}
