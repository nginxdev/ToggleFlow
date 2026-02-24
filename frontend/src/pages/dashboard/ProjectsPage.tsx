import { useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Trash2, Loader2 } from "lucide-react";
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
  const [newProject, setNewProject] = useState({
    name: "",
    key: "",
    description: "",
  });

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

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
      console.error("Failed to create project:", error);
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
      console.error("Failed to delete project:", error);
      alert("Failed to delete project.");
    }
  };

  const handleNameChange = (name: string) => {
    setNewProject({
      ...newProject,
      name,
      key: toCamelCase(name),
    });
  };

  if (loading) {
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("projects.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("projects.subtitle")}</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
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
                  <Label htmlFor="name">{t("projects.projectName")}</Label>
                  <Input
                    id="name"
                    placeholder={t("projects.namePlaceholder")}
                    value={newProject.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="key">{t("projects.projectKey")}</Label>
                  <Input
                    id="key"
                    placeholder={t("projects.keyPlaceholder")}
                    value={newProject.key}
                    onChange={(e) => setNewProject({ ...newProject, key: e.target.value })}
                  />
                  <p className="text-muted-foreground text-xs">{t("projects.keyHint")}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("projects.description")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("projects.descPlaceholder")}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
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
        </div>

        {/* Projects Table */}
        {projects.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
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
          <div className="rounded-lg border">
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
                      {project.description || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project._count?.environments || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project._count?.flags || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setProjectToDelete(project)}
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

        {/* Info Card */}
        <div className="bg-muted/50 rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">{t("projects.infoTitle")}</h3>
          <p className="text-muted-foreground text-sm">{t("projects.infoDesc")}</p>
        </div>
      </div>

      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setProjectToDelete(null);
            setDeleteConfirmation("");
          }
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
    </DashboardLayout>
  );
}
