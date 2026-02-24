import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSegmentStore } from "@/store/segmentStore";

export default function SegmentsPage() {
  const { t } = useTranslation();
  const { segments, fetchSegments, createSegment, updateSegment, deleteSegment, loading } =
    useSegmentStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    attribute: "",
    operator: "IS_IN",
    value: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const projectId = user.lastProjectId;

  useEffect(() => {
    if (projectId) {
      fetchSegments(projectId);
    }
  }, [projectId, fetchSegments]);

  const generateKey = (name: string) =>
    name
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase(),
      )
      .replace(/\s+/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingSegment) {
      setFormData((prev) => ({ ...prev, name, key: generateKey(name) }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  const handleSubmit = async () => {
    if (!projectId) return;
    try {
      const values = formData.value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
      const rules = [{ attribute: formData.attribute, operator: formData.operator, value: values }];

      if (editingSegment) {
        await updateSegment(editingSegment.id, {
          name: formData.name,
          description: formData.description,
          rules,
        });
      } else {
        await createSegment(projectId, {
          name: formData.name,
          key: formData.key,
          description: formData.description,
          rules,
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (segment: any) => {
    setEditingSegment(segment);
    const rule = segment.rules?.[0] || { attribute: "", operator: "IS_IN", value: [] };
    const valueStr = Array.isArray(rule.value) ? rule.value.join(", ") : rule.value;
    setFormData({
      name: segment.name,
      key: segment.key,
      description: segment.description || "",
      attribute: rule.attribute,
      operator: rule.operator || "IS_IN",
      value: valueStr,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("common.confirmDelete"))) {
      await deleteSegment(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", key: "", description: "", attribute: "", operator: "IS_IN", value: "" });
    setEditingSegment(null);
  };

  const filteredSegments = segments.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  /** Shared create/edit dialog form */
  const SegmentFormDialog = (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          {t("segments.create")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingSegment ? t("segments.edit") : t("segments.create")}</DialogTitle>
          <DialogDescription>{t("segments.defineGroup")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="seg-name">{t("flags.name")}</Label>
            <Input
              id="seg-name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Beta Users"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seg-key">{t("flags.key")}</Label>
            <Input
              id="seg-key"
              value={formData.key}
              disabled={!!editingSegment}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              className="bg-muted font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="seg-desc">{t("flags.description")}</Label>
            <Textarea
              id="seg-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="mt-2 border-t pt-4">
            <h4 className="mb-3 text-sm font-medium">{t("segments.targetingRule")}</h4>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="seg-attr">{t("segments.attribute")}</Label>
                  <Input
                    id="seg-attr"
                    value={formData.attribute}
                    onChange={(e) => setFormData({ ...formData, attribute: e.target.value })}
                    placeholder={t("segments.attributePlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seg-op">{t("segments.operator")}</Label>
                  <Select
                    value={formData.operator}
                    onValueChange={(val) => setFormData({ ...formData, operator: val })}
                  >
                    <SelectTrigger id="seg-op" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IS_IN">{t("segments.isIn")}</SelectItem>
                      <SelectItem value="IS_NOT_IN">{t("segments.isNotIn")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seg-val">{t("segments.values")}</Label>
                <Textarea
                  id="seg-val"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={t("segments.valuesPlaceholder")}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit}>
            {editingSegment ? t("common.save") : t("segments.create")}
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
              {t("segments.title")}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{t("segments.descHelper")}</p>
          </div>
          <div className="hidden sm:block">{SegmentFormDialog}</div>
        </div>

        {/* Search + Add (mobile: Add on top, full-width; desktop: just search bar) */}
        <div className="flex flex-col gap-2 sm:block">
          <div className="sm:hidden">{SegmentFormDialog}</div>
          <div className="relative">
            <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={t("segments.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
            />
          </div>
        </div>

        {/* ── MOBILE: card list (hidden sm+) ── */}
        <div className="flex flex-col gap-3 sm:hidden">
          {loading ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              {t("common.loading")}
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <Users className="text-muted-foreground h-12 w-12" />
              <p className="text-muted-foreground text-sm">{t("segments.noSegments")}</p>
            </div>
          ) : (
            <>
              {filteredSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="bg-card border-border flex w-full items-center gap-3 rounded-lg border p-4 shadow-sm"
                >
                  <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                    <Users className="text-muted-foreground h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{segment.name}</p>
                    <p className="text-muted-foreground truncate font-mono text-xs">
                      {segment.key}
                    </p>
                    {segment.rules?.[0] && (
                      <p className="text-muted-foreground mt-0.5 truncate text-xs">
                        <span className="text-primary font-mono">
                          {segment.rules[0].attribute}
                        </span>
                        {" "}
                        {segment.rules[0].operator === "IS_NOT_IN"
                          ? t("segments.isNotIn")
                          : t("segments.isIn")}
                        {" "}
                        {t("segments.valuesCount", {
                          count: Array.isArray(segment.rules[0].value)
                            ? segment.rules[0].value.length
                            : 1,
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(segment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(segment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {/* Floating create at bottom of list */}
              <div className="pt-2">{SegmentFormDialog}</div>
            </>
          )}
        </div>

        {/* ── DESKTOP: table (hidden below sm) ── */}
        <div className="border-border bg-card hidden rounded-lg border shadow-sm sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("flags.name")}</TableHead>
                <TableHead>{t("flags.key")}</TableHead>
                <TableHead>{t("segments.targetingRule")}</TableHead>
                <TableHead className="w-[56px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground py-10 text-center">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : filteredSegments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-16 text-center">
                    <Users className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                    <p className="text-muted-foreground text-sm">{t("segments.noSegments")}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSegments.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Users className="text-muted-foreground h-4 w-4 shrink-0" />
                        <div>
                          <p>{segment.name}</p>
                          {segment.description && (
                            <p className="text-muted-foreground max-w-xs truncate text-xs">
                              {segment.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted rounded px-2 py-1 text-sm">{segment.key}</code>
                    </TableCell>
                    <TableCell>
                      {segment.rules?.map((rule: any, i: number) => (
                        <div key={i} className="text-sm">
                          <code className="text-primary">{rule.attribute}</code>
                          <span className="text-muted-foreground mx-1">
                            {rule.operator === "IS_NOT_IN"
                              ? t("segments.isNotIn")
                              : t("segments.isIn")}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {t("segments.valuesCount", {
                              count: Array.isArray(rule.value) ? rule.value.length : 1,
                            })}
                          </Badge>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(segment)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(segment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

    </DashboardLayout>
  );
}
