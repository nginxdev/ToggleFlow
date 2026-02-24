import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Layers, Trash2, Edit, Loader2, ShieldAlert, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/store/projectStore";
import { toCamelCase } from "@/lib/string-utils";
import { DEFAULT_ENVIRONMENT_KEYS } from "@/types";
import type { Environment } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const isDefaultEnvironment = (key: string) =>
  DEFAULT_ENVIRONMENT_KEYS.includes(key as (typeof DEFAULT_ENVIRONMENT_KEYS)[number]);

export default function EnvironmentsPage() {
  const { t } = useTranslation();
  const {
    environments,
    loading,
    selectedProject,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useProjectStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newEnvironment, setNewEnvironment] = useState({
    name: "",
    key: "",
    requireConfirmation: false,
  });
  const [envToDelete, setEnvToDelete] = useState<Environment | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [envToEdit, setEnvToEdit] = useState<Environment | null>(null);
  const [selectedEnv, setSelectedEnv] = useState<Environment | null>(null);
  const [editForm, setEditForm] = useState({ name: "", key: "", requireConfirmation: false });
  const [isEditing, setIsEditing] = useState(false);

  const handleCreateEnvironment = async () => {
    if (!newEnvironment.name || !newEnvironment.key || !selectedProject) return;
    setIsCreating(true);
    try {
      await createEnvironment(selectedProject.id, {
        name: newEnvironment.name,
        key: newEnvironment.key,
        requireConfirmation: newEnvironment.requireConfirmation,
      });
      setIsCreateDialogOpen(false);
      setNewEnvironment({ name: "", key: "", requireConfirmation: false });
    } catch (error) {
      console.error(error);
      alert("Failed to create environment. Key might already exist.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditEnvironment = async () => {
    if (!envToEdit || !editForm.name || !editForm.key) return;
    setIsEditing(true);
    try {
      await updateEnvironment(envToEdit.id, {
        name: editForm.name,
        key: editForm.key,
        requireConfirmation: editForm.requireConfirmation,
      });
      setEnvToEdit(null);
      setEditForm({ name: "", key: "", requireConfirmation: false });
    } catch (error) {
      console.error(error);
      alert("Failed to update environment. Key might already exist.");
    } finally {
      setIsEditing(false);
    }
  };

  const openEditDialog = (env: Environment) => {
    setEnvToEdit(env);
    setEditForm({ name: env.name, key: env.key, requireConfirmation: env.requireConfirmation });
  };

  const confirmDeleteEnvironment = async () => {
    if (!envToDelete || isDefaultEnvironment(envToDelete.key)) return;
    try {
      await deleteEnvironment(envToDelete.id);
      setEnvToDelete(null);
      setDeleteConfirmation("");
    } catch (error) {
      console.error(error);
      alert("Failed to delete environment.");
    }
  };

  const handleNameChange = (name: string) =>
    setNewEnvironment({ ...newEnvironment, name, key: toCamelCase(name) });

  const CreateEnvDialog = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("environments.newEnvironment")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("environments.createEnvironment")}</DialogTitle>
          <DialogDescription>{t("environments.createDesc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="env-name">{t("environments.environmentName")}</Label>
            <Input
              id="env-name"
              placeholder={t("environments.namePlaceholder")}
              value={newEnvironment.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="env-key">{t("environments.environmentKey")}</Label>
            <Input id="env-key" value={newEnvironment.key} disabled className="bg-muted font-mono" />
            <p className="text-muted-foreground text-xs">{t("environments.keyAutoGenerated")}</p>
          </div>
          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="requireConfirmation"
              checked={newEnvironment.requireConfirmation}
              onCheckedChange={(checked) =>
                setNewEnvironment({ ...newEnvironment, requireConfirmation: !!checked })
              }
            />
            <div className="grid gap-1 leading-none">
              <label htmlFor="requireConfirmation" className="text-sm font-medium leading-none">
                {t("environments.requireConfirmation")}
              </label>
              <p className="text-muted-foreground text-xs">
                {t("environments.requireConfirmationDesc")}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreateEnvironment}
            disabled={!newEnvironment.name || !newEnvironment.key || isCreating}
          >
            <Loader2 className={cn("h-4 w-4 animate-spin", !isCreating && "invisible")} />
            {isCreating ? t("common.creating") : t("environments.createEnvironment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t("environments.title")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("environments.subtitle")}</p>
          </div>
          <div className="hidden sm:block">{CreateEnvDialog}</div>
        </div>

        {loading ? (
          <div className="text-muted-foreground py-12 text-center">{t("common.loading")}</div>
        ) : (
          <>
            {/* ── MOBILE: card list (hidden sm+) ── */}
            <div className="flex flex-col gap-3 sm:hidden">
              {/* Mobile Add button – always at top */}
              <div className="sm:hidden">{CreateEnvDialog}</div>
              {environments.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <Layers className="text-muted-foreground h-14 w-14" />
                  <h3 className="font-semibold">{t("environments.noEnvironments")}</h3>
                  <p className="text-muted-foreground max-w-xs text-sm">
                    {t("environments.noEnvironmentsDesc")}
                  </p>
                </div>
              ) : (
                <>
                  {environments.map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setSelectedEnv(env)}
                      className={cn(
                        "bg-card border-border flex w-full items-center gap-3 rounded-lg border p-4 text-left shadow-sm",
                        "active:bg-muted transition-colors",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          env.key === "production" ? "bg-green-500/10" : "bg-muted",
                        )}
                      >
                        <Layers
                          className={cn(
                            "h-4 w-4",
                            env.key === "production" ? "text-green-600" : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="truncate font-medium">{env.name}</p>
                          {isDefaultEnvironment(env.key) && (
                            <Badge variant="outline" className="text-xs">
                              {t("environments.default")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate font-mono text-xs">{env.key}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          <Badge
                            variant={env.key === "production" ? "default" : "secondary"}
                            className={cn(
                              "text-xs",
                              env.key === "production" && "bg-green-500 hover:bg-green-600",
                            )}
                          >
                            {env.key === "production" ? t("common.live") : t("common.active")}
                          </Badge>
                          {env.requireConfirmation && (
                            <Badge
                              variant="outline"
                              className="border-amber-500/50 bg-amber-500/10 text-xs text-amber-500"
                            >
                              Confirmation required
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                    </button>
                  ))}
                  <div className="pt-2">{CreateEnvDialog}</div>
                </>
              )}
            </div>

            {/* ── DESKTOP: table (hidden below sm) ── */}
            {environments.length === 0 ? (
              <div className="hidden rounded-lg border p-12 text-center sm:block">
                <Layers className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 text-lg font-semibold">{t("environments.noEnvironments")}</h3>
                <p className="text-muted-foreground mx-auto mb-4 max-w-md">
                  {t("environments.noEnvironmentsDesc")}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t("environments.createEnvironment")}
                </Button>
              </div>
            ) : (
              <div className="border-border bg-card hidden rounded-lg border shadow-sm sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("environments.name")}</TableHead>
                      <TableHead>{t("environments.key")}</TableHead>
                      <TableHead>{t("environments.status")}</TableHead>
                      <TableHead>{t("environments.requireConfirmation")}</TableHead>
                      <TableHead className="text-right">{t("common.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {environments.map((env) => (
                      <TableRow key={env.id}>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2">
                            {env.name}
                            {isDefaultEnvironment(env.key) && (
                              <Badge variant="outline" className="text-xs">
                                {t("environments.default")}
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-sm">
                          {env.key}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={env.key === "production" ? "default" : "secondary"}
                            className={env.key === "production" ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {env.key === "production" ? t("common.live") : t("common.active")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {env.requireConfirmation ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/50 bg-amber-500/10 text-amber-500"
                            >
                              {t("common.active")}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDefaultEnvironment(env.key)}
                              onClick={() => openEditDialog(env)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isDefaultEnvironment(env.key)}
                              onClick={() => setEnvToDelete(env)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}

      </div>

      {/* Mobile env detail dialog */}
      <Dialog open={!!selectedEnv} onOpenChange={(open) => !open && setSelectedEnv(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <span className="flex items-center gap-2">
                {selectedEnv?.name}
                {selectedEnv && isDefaultEnvironment(selectedEnv.key) && (
                  <Badge variant="outline" className="text-xs">
                    {t("environments.default")}
                  </Badge>
                )}
              </span>
            </DialogTitle>
            <DialogDescription>
              <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                {selectedEnv?.key}
              </code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground text-sm">{t("environments.status")}</span>
              {selectedEnv && (
                <Badge
                  variant={selectedEnv.key === "production" ? "default" : "secondary"}
                  className={selectedEnv.key === "production" ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {selectedEnv.key === "production" ? t("common.live") : t("common.active")}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {t("environments.requireConfirmation")}
              </span>
              {selectedEnv?.requireConfirmation ? (
                <Badge
                  variant="outline"
                  className="border-amber-500/50 bg-amber-500/10 text-amber-500"
                >
                  {t("common.active")}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              className="w-full"
              disabled={selectedEnv ? isDefaultEnvironment(selectedEnv.key) : true}
              onClick={() => {
                if (selectedEnv) openEditDialog(selectedEnv);
                setSelectedEnv(null);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              disabled={selectedEnv ? isDefaultEnvironment(selectedEnv.key) : true}
              onClick={() => {
                setEnvToDelete(selectedEnv);
                setSelectedEnv(null);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={!!envToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setEnvToEdit(null);
            setEditForm({ name: "", key: "", requireConfirmation: false });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("environments.editEnvironment")}</DialogTitle>
            <DialogDescription>{t("environments.editDesc")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">{t("environments.environmentName")}</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value, key: toCamelCase(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-key">{t("environments.environmentKey")}</Label>
              <Input id="edit-key" value={editForm.key} disabled className="bg-muted font-mono" />
              <p className="text-muted-foreground text-xs">{t("environments.keyAutoGenerated")}</p>
            </div>
            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="edit-requireConfirmation"
                checked={editForm.requireConfirmation}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, requireConfirmation: !!checked })
                }
              />
              <div className="grid gap-1 leading-none">
                <label
                  htmlFor="edit-requireConfirmation"
                  className="text-sm font-medium leading-none"
                >
                  {t("environments.requireConfirmation")}
                </label>
                <p className="text-muted-foreground text-xs">
                  {t("environments.requireConfirmationDesc")}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEnvToEdit(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleEditEnvironment}
              disabled={!editForm.name || !editForm.key || isEditing}
            >
              <Loader2 className={cn("h-4 w-4 animate-spin", !isEditing && "invisible")} />
              {isEditing ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!envToDelete}
        onOpenChange={(open) => {
          if (!open) { setEnvToDelete(null); setDeleteConfirmation(""); }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("environments.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {envToDelete && isDefaultEnvironment(envToDelete.key) ? (
                <span className="flex items-center gap-2 text-amber-500">
                  <ShieldAlert className="h-4 w-4" />
                  {t("environments.deleteProtected")}
                </span>
              ) : (
                t("environments.deleteWarning")
              )}
            </AlertDialogDescription>
            {envToDelete && !isDefaultEnvironment(envToDelete.key) && (
              <div className="mt-4 w-full">
                <Label htmlFor="confirm-env-delete" className="mb-2 block">
                  <Trans
                    i18nKey="environments.deleteInstruction"
                    values={{ name: envToDelete.name }}
                    components={{ strong: <span className="font-mono font-bold" /> }}
                  />
                </Label>
                <Input
                  id="confirm-env-delete"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={envToDelete.name}
                  className="w-full"
                />
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            {envToDelete && !isDefaultEnvironment(envToDelete.key) && (
              <AlertDialogAction
                variant="destructive"
                onClick={confirmDeleteEnvironment}
                disabled={deleteConfirmation !== envToDelete.name}
              >
                {t("environments.deleteAction")}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
