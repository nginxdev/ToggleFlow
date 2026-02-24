import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, Loader2, Flag, History, Trash2, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFlagStore } from "@/store/flagStore";
import { useProjectStore } from "@/store/projectStore";
import { cn } from "@/lib/utils";
import type { FeatureFlag } from "@/types";

export default function ArchivedFlagsPage() {
  const { t } = useTranslation();
  const { selectedProject } = useProjectStore();
  const { archivedFlags, loading, fetchArchivedFlags, unarchiveFlag, deleteFlag } = useFlagStore();
  const navigate = useNavigate();

  const [flagToDelete, setFlagToDelete] = useState<FeatureFlag | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isRestoring, setIsRestoring] = useState<string | null>(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperUser = currentUser.isSuperUser || currentUser.email === "john.doe@toggleflow.com";

  useEffect(() => {
    if (selectedProject) {
      fetchArchivedFlags(selectedProject.id);
    }
  }, [selectedProject, fetchArchivedFlags]);

  const handleRestore = async (id: string) => {
    setIsRestoring(id);
    try {
      await unarchiveFlag(id);
    } catch (error) {
      console.error("Failed to restore flag:", error);
    } finally {
      setIsRestoring(null);
    }
  };

  const confirmDeleteFlag = async () => {
    if (!flagToDelete) return;

    try {
      await deleteFlag(flagToDelete.id);
      setFlagToDelete(null);
      setDeleteConfirmation("");
    } catch (error) {
      console.error("Failed to delete flag:", error);
    }
  };

  if (loading && !archivedFlags.length) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/flags")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("flags.archivedTitle")}</h1>
              <p className="text-muted-foreground mt-1">
                Flags that have been archived. Most functionality is disabled for these flags.
              </p>
            </div>
          </div>
        </div>

        {archivedFlags.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
            <Flag className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-lg font-semibold">No Archived Flags</h3>
            <p className="text-muted-foreground mx-auto max-w-md">
              Flags you archive will appear here. You can restore them to the active list at any
              time.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("flags.name")}</TableHead>
                  <TableHead>{t("flags.key")}</TableHead>
                  <TableHead>{t("flags.type")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-medium">
                      <Link to={`/dashboard/flags/${flag.id}`} className="hover:underline">
                        {flag.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {flag.key}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{flag.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(flag.id)}
                          disabled={isRestoring === flag.id}
                        >
                          <span className="relative size-4 shrink-0">
                            <History className={cn("h-4 w-4 transition-opacity", isRestoring === flag.id && "opacity-0")} />
                            <Loader2 className={cn("absolute inset-0 h-4 w-4 animate-spin transition-opacity", isRestoring !== flag.id && "opacity-0")} />
                          </span>
                          {t("flagDetails.settings.restoreFlag")}
                        </Button>

                        {isSuperUser && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive font-semibold"
                                onClick={() => setFlagToDelete(flag)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("common.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AlertDialog
        open={!!flagToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setFlagToDelete(null);
            setDeleteConfirmation("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("flags.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("flags.deletePermanentWarning")}</AlertDialogDescription>
            {flagToDelete && (
              <div className="mt-4 w-full">
                <Label htmlFor="confirm-archived-delete" className="mb-2 block">
                  <Trans
                    i18nKey="flags.deleteInstruction"
                    values={{ key: flagToDelete.key }}
                    components={{ strong: <span className="font-mono font-bold" /> }}
                  />
                </Label>
                <Input
                  id="confirm-archived-delete"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={flagToDelete.key}
                  className="w-full"
                />
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            {flagToDelete && (
              <AlertDialogAction
                variant="destructive"
                onClick={confirmDeleteFlag}
                disabled={deleteConfirmation !== flagToDelete.key}
              >
                {t("flags.deletePermanent")}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
