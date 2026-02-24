import { useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Trash2, Loader2, ChevronRight } from "lucide-react";
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
import type { Project } from "@/types";
import { toCamelCase } from "@/lib/string-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", key: "", description: "" });
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.key) return;
    setIsCreating(true);
    try {
      await createProject({
        name: newProject.name,
        key: newProject.key,
        description: newProject.description || undefined,
      });
      setIsCreateDialogOpen(false);
      setNewProject({ name: "", key: "", description: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to create project. Key might already exist.");
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    } catch (error) {
      console.error(error);
      alert("Failed to delete project.");
    }
  };

  const handleNameChange = (name: string) =>
    setNewProject({ ...newProject, name, key: toCamelCase(name) });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const CreateProjectDialog = (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("projects.newProject")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("projects.createNew")}</DialogTitle>
          <DialogDescription>{t("projects.createDesc")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="proj-name">{t("projects.projectName")}</Label>
            <Input
              id="proj-name"
              placeholder={t("projects.namePlaceholder")}
              value={newProject.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proj-key">{t("projects.projectKey")}</Label>
            <Input
              id="proj-key"
              placeholder={t("projects.keyPlaceholder")}
              value={newProject.key}
              onChange={(e) => setNewProject({ ...newProject, key: e.target.value })}
              className="bg-muted font-mono"
            />
            <p className="text-muted-foreground text-xs">{t("projects.keyHint")}</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="proj-desc">{t("projects.description")}</Label>
            <Textarea
              id="proj-desc"
              placeholder={t("projects.descPlaceholder")}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCreateProject}
            disabled={!newProject.name || !newProject.key || isCreating}
          >
            <Loader2 className={cn("h-4 w-4 animate-spin", !isCreating && "invisible")} />
            {isCreating ? t("common.creating") : t("projects.createNew")}
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("projects.title")}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("projects.subtitle")}</p>
          </div>
          <div className="hidden sm:block">{CreateProjectDialog}</div>
        </div>

        {/* ── MOBILE: card list (hidden sm+) ── */}
        <div className="flex flex-col gap-3 sm:hidden">
          {/* Mobile Add button – always at top */}
          <div>{CreateProjectDialog}</div>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Folder className="text-muted-foreground h-14 w-14" />
              <h3 className="font-semibold">{t("projects.noProjects")}</h3>
              <p className="text-muted-foreground max-w-xs text-sm">
                {t("projects.noProjectsDesc")}
              </p>
            </div>
          ) : (
            <>
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setDetailProject(project)}
                  className={cn(
                    "bg-card border-border flex w-full items-center gap-3 rounded-lg border p-4 text-left shadow-sm",
                    "active:bg-muted transition-colors",
                  )}
                >
                  <div className="bg-primary/10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Folder className="text-primary h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{project.name}</p>
                    <p className="text-muted-foreground truncate font-mono text-xs">{project.key}</p>
                    {project.description && (
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {project._count?.environments || 0} envs
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {project._count?.flags || 0} flags
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                </button>
              ))}
            </>
          )}
        </div>

        {/* ── DESKTOP: table (hidden below sm) ── */}
        {projects.length === 0 ? (
          <div className="hidden rounded-lg border p-12 text-center sm:block">
            <Folder className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <h3 className="mb-2 text-lg font-semibold">{t("projects.noProjects")}</h3>
            <p className="text-muted-foreground mx-auto mb-4 max-w-md">
              {t("projects.noProjectsDesc")}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("projects.createFirst")}
            </Button>
          </div>
        ) : (
          <div className="border-border bg-card hidden rounded-lg border shadow-sm sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("projects.projectName")}</TableHead>
                  <TableHead>{t("projects.projectKey")}</TableHead>
                  <TableHead>{t("projects.description")}</TableHead>
                  <TableHead>{t("projects.environmentCount")}</TableHead>
                  <TableHead>{t("projects.flagCount")}</TableHead>
                  <TableHead className="text-right">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">
                      {project.key}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                      {project.description || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project._count?.environments || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project._count?.flags || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setProjectToDelete(project)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

      </div>

      {/* Delete confirm */}
      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => {
          if (!open) { setProjectToDelete(null); setDeleteConfirmation(""); }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("projects.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("projects.deleteConfirm")}</AlertDialogDescription>
            <div className="mt-4 w-full">
              <Label htmlFor="confirm-delete" className="mb-2 block">
                <Trans
                  i18nKey="projects.deleteInstruction"
                  values={{ key: projectToDelete?.key }}
                  components={{ strong: <span className="font-mono font-bold" /> }}
                />
              </Label>
              <Input
                id="confirm-delete"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={projectToDelete?.key}
                className="w-full"
              />
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDeleteProject}
              disabled={deleteConfirmation !== projectToDelete?.key}
            >
              {t("projects.deleteAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile project detail dialog */}
      <Dialog open={!!detailProject} onOpenChange={(open) => !open && setDetailProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="text-primary h-5 w-5" />
              {detailProject?.name}
            </DialogTitle>
            <DialogDescription>
              <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                {detailProject?.key}
              </code>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {detailProject?.description && (
              <p className="text-muted-foreground border-b pb-3 text-sm">
                {detailProject.description}
              </p>
            )}
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-muted-foreground text-sm">{t("projects.environmentCount")}</span>
              <Badge variant="secondary">{detailProject?._count?.environments || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{t("projects.flagCount")}</span>
              <Badge variant="secondary">{detailProject?._count?.flags || 0}</Badge>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => { setProjectToDelete(detailProject); setDetailProject(null); }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
