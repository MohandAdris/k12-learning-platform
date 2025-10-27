import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function CourseEdit() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/teacher/courses/:id/edit");
  const courseId = params?.id ? parseInt(params.id) : 0;

  const { data: course, isLoading } = trpc.courses.get.useQuery({ id: courseId });

  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    titleHe: "",
    description: "",
    descriptionAr: "",
    descriptionHe: "",
    thumbnailUrl: "",
    estimatedDuration: 0,
    tags: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.course.title || "",
        titleAr: course.course.titleAr || "",
        titleHe: course.course.titleHe || "",
        description: course.course.description || "",
        descriptionAr: course.course.descriptionAr || "",
        descriptionHe: course.course.descriptionHe || "",
        thumbnailUrl: course.course.thumbnailUrl || "",
        estimatedDuration: course.course.estimatedDuration || 0,
        tags: course.course.tags?.join(", ") || "",
        visibility: course.course.visibility || "PUBLIC",
      });
    }
  }, [course]);

  const updateCourseMutation = trpc.courses.update.useMutation({
    onSuccess: () => {
      toast.success(t("messages.courseUpdated"));
      setLocation("/teacher");
    },
    onError: (error) => {
      toast.error(error.message || t("messages.networkError"));
    },
  });

  const deleteCourseMutation = trpc.courses.delete.useMutation({
    onSuccess: () => {
      toast.success(t("messages.courseDeleted"));
      setLocation("/teacher");
    },
    onError: (error) => {
      toast.error(error.message || t("messages.networkError"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error(t("errors.required"));
      return;
    }

    updateCourseMutation.mutate({
      id: courseId,
      title: formData.title,
      titleAr: formData.titleAr || undefined,
      titleHe: formData.titleHe || undefined,
      description: formData.description,
      descriptionAr: formData.descriptionAr || undefined,
      descriptionHe: formData.descriptionHe || undefined,
      thumbnailUrl: formData.thumbnailUrl || undefined,
      estimatedDuration: formData.estimatedDuration,
      visibility: formData.visibility,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  };

  const handleDelete = () => {
    deleteCourseMutation.mutate({ id: courseId });
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  if (!course) {
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
                onClick={() => setLocation("/teacher")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{t("courses.editCourse")}</h1>
                <p className="text-gray-600 mt-1">{course.course.title}</p>
              </div>
            </div>
              <div className="flex items-center space-x-3">
                <Link href={`/teacher/courses/${courseId}/units`}>
                  <Button variant="outline">
                    {t("units.manageUnits")}
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={deleteCourseMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t("common.delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("courses.deleteCourse")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("courses.deleteConfirmation")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {t("common.delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* English Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("languages.en")} Content</CardTitle>
                  <CardDescription>Primary language content (required)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t("courses.title")} *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Introduction to Mathematics"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t("courses.description")}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Learn the fundamentals of mathematics..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Arabic Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("languages.ar")} المحتوى</CardTitle>
                  <CardDescription>Arabic translation (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="titleAr">العنوان</Label>
                    <Input
                      id="titleAr"
                      value={formData.titleAr}
                      onChange={(e) => handleChange("titleAr", e.target.value)}
                      placeholder="مقدمة في الرياضيات"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionAr">الوصف</Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={(e) => handleChange("descriptionAr", e.target.value)}
                      placeholder="تعلم أساسيات الرياضيات..."
                      rows={4}
                      dir="rtl"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Hebrew Content */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("languages.he")} תוכן</CardTitle>
                  <CardDescription>Hebrew translation (optional)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="titleHe">כותרת</Label>
                    <Input
                      id="titleHe"
                      value={formData.titleHe}
                      onChange={(e) => handleChange("titleHe", e.target.value)}
                      placeholder="מבוא למתמטיקה"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionHe">תיאור</Label>
                    <Textarea
                      id="descriptionHe"
                      value={formData.descriptionHe}
                      onChange={(e) => handleChange("descriptionHe", e.target.value)}
                      placeholder="למד את יסודות המתמטיקה..."
                      rows={4}
                      dir="rtl"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.general")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                    <Input
                      id="thumbnailUrl"
                      value={formData.thumbnailUrl}
                      onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.thumbnailUrl && (
                      <img
                        src={formData.thumbnailUrl}
                        alt="Thumbnail preview"
                        className="mt-2 w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="estimatedDuration">
                      {t("courses.estimatedDuration")} ({t("common.minutes")})
                    </Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => handleChange("estimatedDuration", parseInt(e.target.value) || 0)}
                      placeholder="120"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">{t("courses.tags")}</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => handleChange("tags", e.target.value)}
                      placeholder="Mathematics, Algebra, Geometry"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Separate tags with commas
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="visibility">{t("courses.visibility")}</Label>
                    <select
                      id="visibility"
                      value={formData.visibility}
                      onChange={(e) => handleChange("visibility", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="PUBLIC">{t("common.published")}</option>
                      <option value="PRIVATE">{t("common.draft")}</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateCourseMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateCourseMutation.isPending ? t("common.loading") : t("common.save")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/teacher")}
                  >
                    {t("common.cancel")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

