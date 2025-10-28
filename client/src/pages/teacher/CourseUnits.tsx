import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

interface UnitFormData {
  id?: number;
  title: string;
  titleAr: string;
  titleHe: string;
  description: string;
  descriptionAr: string;
  descriptionHe: string;
  order: number;
}

export default function CourseUnits() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/teacher/courses/:id/units");
  const courseId = params?.id ? parseInt(params.id) : 0;

  const { data: courseData, isLoading } = trpc.courses.get.useQuery({ id: courseId });
  const [showForm, setShowForm] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitFormData | null>(null);

  const createUnitMutation = trpc.units.create.useMutation({
    onSuccess: () => {
      toast.success(t("messages.unitCreated"));
      setShowForm(false);
      setEditingUnit(null);
    },
    onError: (error) => {
      toast.error(error.message || t("messages.networkError"));
    },
  });

  const updateUnitMutation = trpc.units.update.useMutation({
    onSuccess: () => {
      toast.success(t("messages.unitUpdated"));
      setShowForm(false);
      setEditingUnit(null);
    },
    onError: (error) => {
      toast.error(error.message || t("messages.networkError"));
    },
  });

  const deleteUnitMutation = trpc.units.delete.useMutation({
    onSuccess: () => {
      toast.success(t("messages.unitDeleted"));
    },
    onError: (error) => {
      toast.error(error.message || t("messages.networkError"));
    },
  });

  const handleCreateUnit = () => {
    const nextOrder = (courseData?.units.length || 0) + 1;
    setEditingUnit({
      title: "",
      titleAr: "",
      titleHe: "",
      description: "",
      descriptionAr: "",
      descriptionHe: "",
      order: nextOrder,
    });
    setShowForm(true);
  };

  const handleEditUnit = (unit: any) => {
    setEditingUnit({
      id: unit.id,
      title: unit.title || "",
      titleAr: unit.titleAr || "",
      titleHe: unit.titleHe || "",
      description: unit.description || "",
      descriptionAr: unit.descriptionAr || "",
      descriptionHe: unit.descriptionHe || "",
      order: unit.order,
    });
    setShowForm(true);
  };

  const handleDeleteUnit = (unitId: number) => {
    if (confirm(t("messages.confirmDelete"))) {
      deleteUnitMutation.mutate({ id: unitId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUnit) return;

    if (!editingUnit.title.trim()) {
      toast.error(t("errors.required"));
      return;
    }

    if (editingUnit.id) {
      // Update existing unit
      updateUnitMutation.mutate({
        id: editingUnit.id,
        title: editingUnit.title,
        titleAr: editingUnit.titleAr || undefined,
        titleHe: editingUnit.titleHe || undefined,
        description: editingUnit.description,
        descriptionAr: editingUnit.descriptionAr || undefined,
        descriptionHe: editingUnit.descriptionHe || undefined,
        order: editingUnit.order,
      });
    } else {
      // Create new unit
      createUnitMutation.mutate({
        courseId,
        title: editingUnit.title,
        titleAr: editingUnit.titleAr || undefined,
        titleHe: editingUnit.titleHe || undefined,
        description: editingUnit.description,
        descriptionAr: editingUnit.descriptionAr || undefined,
        descriptionHe: editingUnit.descriptionHe || undefined,
        order: editingUnit.order,
      });
    }
  };

  const handleChange = (field: keyof UnitFormData, value: string | number) => {
    if (!editingUnit) return;
    setEditingUnit({ ...editingUnit, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">{t("errors.notFound")}</h2>
          <Button className="mt-4" onClick={() => setLocation("/teacher")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(`/teacher/courses/${courseId}/edit`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{t("units.manageUnits")}</h1>
                <p className="text-gray-600 mt-1">{courseData.course.title}</p>
              </div>
            </div>
            <Button onClick={handleCreateUnit}>
              <Plus className="w-4 h-4 mr-2" />
              {t("units.createUnit")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Units List */}
          <div className="lg:col-span-2 space-y-4">
            {courseData.units.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600">{t("units.noUnits")}</p>
                  <Button className="mt-4" onClick={handleCreateUnit}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("units.createFirstUnit")}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              courseData.units.map((unit, index) => (
                <Card key={unit.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <GripVertical className="w-5 h-5 text-gray-400 mt-1 cursor-move" />
                        <div>
                          <CardTitle className="text-lg">
                            {t("units.unit")} {index + 1}: {unit.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {unit.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/teacher/units/${unit.id}/lectures`)}
                        >
                          {t("lectures.manageLectures")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUnit(unit)}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUnit(unit.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>

          {/* Unit Form */}
          {showForm && editingUnit && (
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {editingUnit.id ? t("units.editUnit") : t("units.createUnit")}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForm(false);
                        setEditingUnit(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* English */}
                    <div>
                      <Label htmlFor="title">{t("courses.title")} (EN) *</Label>
                      <Input
                        id="title"
                        value={editingUnit.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        placeholder="Unit 1: Introduction"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">{t("courses.description")} (EN)</Label>
                      <Textarea
                        id="description"
                        value={editingUnit.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        placeholder="Brief description..."
                        rows={3}
                      />
                    </div>

                    {/* Arabic */}
                    <div>
                      <Label htmlFor="titleAr">العنوان (AR)</Label>
                      <Input
                        id="titleAr"
                        value={editingUnit.titleAr}
                        onChange={(e) => handleChange("titleAr", e.target.value)}
                        placeholder="الوحدة 1: مقدمة"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descriptionAr">الوصف (AR)</Label>
                      <Textarea
                        id="descriptionAr"
                        value={editingUnit.descriptionAr}
                        onChange={(e) => handleChange("descriptionAr", e.target.value)}
                        placeholder="وصف مختصر..."
                        rows={3}
                        dir="rtl"
                      />
                    </div>

                    {/* Hebrew */}
                    <div>
                      <Label htmlFor="titleHe">כותרת (HE)</Label>
                      <Input
                        id="titleHe"
                        value={editingUnit.titleHe}
                        onChange={(e) => handleChange("titleHe", e.target.value)}
                        placeholder="יחידה 1: מבוא"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descriptionHe">תיאור (HE)</Label>
                      <Textarea
                        id="descriptionHe"
                        value={editingUnit.descriptionHe}
                        onChange={(e) => handleChange("descriptionHe", e.target.value)}
                        placeholder="תיאור קצר..."
                        rows={3}
                        dir="rtl"
                      />
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createUnitMutation.isPending || updateUnitMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {createUnitMutation.isPending || updateUnitMutation.isPending ? t("common.loading") : (editingUnit.id ? t("common.update") : t("common.create"))}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setShowForm(false);
                          setEditingUnit(null);
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

