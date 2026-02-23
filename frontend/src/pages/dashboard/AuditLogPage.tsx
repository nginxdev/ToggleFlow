import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Activity } from "lucide-react";

export default function AuditLogPage() {
  const { t } = useTranslation();
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("auditLog.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("auditLog.subtitle")}</p>
          </div>
        </div>

        <div className="rounded-lg border p-12 text-center">
          <Activity className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <h3 className="mb-2 text-lg font-semibold">{t("auditLog.comingSoon")}</h3>
          <p className="text-muted-foreground mx-auto mb-4 max-w-md">
            {t("auditLog.comingSoonDesc")}
          </p>
          <p className="text-muted-foreground text-sm">{t("auditLog.underDevelopment")}</p>
        </div>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">{t("auditLog.plannedFeatures")}</h3>
          <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
            <li>{t("auditLog.timeline")}</li>
            <li>{t("auditLog.filtering")}</li>
            <li>{t("auditLog.export")}</li>
            <li>{t("auditLog.notifications")}</li>
            <li>{t("auditLog.rollback")}</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
