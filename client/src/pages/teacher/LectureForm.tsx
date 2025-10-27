import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface LectureFormData {
  unitId: number;
  title: string;
  titleAr: string;
  titleHe: string;
  description: string;
  descriptionAr: string;
  descriptionHe: string;
  videoUrl: string;
  videoUrlAr: string;
  videoUrlHe: string;
  durationSec: number;
  captionsUrl: string;
  captionsUrlAr: string;
  captionsUrlHe: string;
  summaryMarkdown: string;
  summaryMarkdownAr: string;
  summaryMarkdownHe: string;
  order: number;
}

export default function LectureForm() {
  const { lectureId, unitId } = useParams();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const isEditing = !!lectureId;

  // Fetch lecture data if editing
  const { data: lectureData, isLoading: lectureLoading } = trpc.lectures.get.useQuery(
    { id: Number(lectureId) },
    { enabled: isEditing }
  );

  // Fetch unit to get next order number
  const { data: unitData } = trpc.units.get.useQuery(
    { id: Number(unitId) },
    { enabled: !isEditing && !!unitId }
  );

  const [formData, setFormData] = useState<LectureFormData>({
    unitId: Number(unitId),
    title: '',
    titleAr: '',
    titleHe: '',
    description: '',
    descriptionAr: '',
    descriptionHe: '',
    videoUrl: '',
    videoUrlAr: '',
    videoUrlHe: '',
    durationSec: 0,
    captionsUrl: '',
    captionsUrlAr: '',
    captionsUrlHe: '',
    summaryMarkdown: '',
    summaryMarkdownAr: '',
    summaryMarkdownHe: '',
    order: 0,
  });

  // Populate form when editing
  useEffect(() => {
    if (lectureData && isEditing) {
      const lecture = lectureData.lecture;
      setFormData({
        unitId: lecture.unitId,
        title: lecture.title || '',
        titleAr: lecture.titleAr || '',
        titleHe: lecture.titleHe || '',
        description: lecture.description || '',
        descriptionAr: lecture.descriptionAr || '',
        descriptionHe: lecture.descriptionHe || '',
        videoUrl: lecture.videoUrl || '',
        videoUrlAr: lecture.videoUrlAr || '',
        videoUrlHe: lecture.videoUrlHe || '',
        durationSec: lecture.durationSec || 0,
        captionsUrl: lecture.captionsUrl || '',
        captionsUrlAr: lecture.captionsUrlAr || '',
        captionsUrlHe: lecture.captionsUrlHe || '',
        summaryMarkdown: lecture.summaryMarkdown || '',
        summaryMarkdownAr: lecture.summaryMarkdownAr || '',
        summaryMarkdownHe: lecture.summaryMarkdownHe || '',
        order: lecture.order,
      });
    }
  }, [lectureData, isEditing]);

  // Set order for new lecture
  useEffect(() => {
    if (!isEditing && unitData) {
      const maxOrder = Math.max(0, ...unitData.lectures.map((l: any) => l.order));
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [unitData, isEditing]);

  const createMutation = trpc.lectures.create.useMutation({
    onSuccess: () => {
      toast.success(t('messages.lectureCreated'));
      navigate(`/teacher/units/${unitId}/lectures`);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  const updateMutation = trpc.lectures.update.useMutation({
    onSuccess: () => {
      toast.success(t('messages.lectureUpdated'));
      navigate(`/teacher/units/${unitId}/lectures`);
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  const handleChange = (field: keyof LectureFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.videoUrl) {
      toast.error(t('errors.required'));
      return;
    }

    if (isEditing) {
      await updateMutation.mutateAsync({
        id: Number(lectureId),
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  if (lectureLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/teacher/units/${unitId}/lectures`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? t('lectures.editLecture') : t('lectures.createLecture')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing ? t('lectures.editLectureDescription') : t('lectures.createLectureDescription')}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="en" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
            <TabsTrigger value="ar">🇸🇦 العربية</TabsTrigger>
            <TabsTrigger value="he">🇮🇱 עברית</TabsTrigger>
          </TabsList>

          {/* English Tab */}
          <TabsContent value="en" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>English Content</CardTitle>
                <CardDescription>Lecture information in English</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Introduction to Algebra"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of the lecture..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleChange('videoUrl', e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="captionsUrl">Captions URL</Label>
                  <Input
                    id="captionsUrl"
                    type="url"
                    value={formData.captionsUrl}
                    onChange={(e) => handleChange('captionsUrl', e.target.value)}
                    placeholder="https://example.com/captions.vtt"
                  />
                </div>
                <div>
                  <Label htmlFor="summaryMarkdown">Summary (Markdown)</Label>
                  <Textarea
                    id="summaryMarkdown"
                    value={formData.summaryMarkdown}
                    onChange={(e) => handleChange('summaryMarkdown', e.target.value)}
                    placeholder="# Lecture Summary\n\nKey points covered in this lecture..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Arabic Tab */}
          <TabsContent value="ar" className="space-y-6">
            <Card dir="rtl">
              <CardHeader>
                <CardTitle>المحتوى العربي</CardTitle>
                <CardDescription>معلومات المحاضرة بالعربية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titleAr">العنوان</Label>
                  <Input
                    id="titleAr"
                    value={formData.titleAr}
                    onChange={(e) => handleChange('titleAr', e.target.value)}
                    placeholder="مقدمة في الجبر"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionAr">الوصف</Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => handleChange('descriptionAr', e.target.value)}
                    placeholder="وصف موجز للمحاضرة..."
                    rows={3}
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrlAr">رابط الفيديو</Label>
                  <Input
                    id="videoUrlAr"
                    type="url"
                    value={formData.videoUrlAr}
                    onChange={(e) => handleChange('videoUrlAr', e.target.value)}
                    placeholder="https://example.com/video-ar.mp4"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="captionsUrlAr">رابط الترجمة</Label>
                  <Input
                    id="captionsUrlAr"
                    type="url"
                    value={formData.captionsUrlAr}
                    onChange={(e) => handleChange('captionsUrlAr', e.target.value)}
                    placeholder="https://example.com/captions-ar.vtt"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="summaryMarkdownAr">الملخص</Label>
                  <Textarea
                    id="summaryMarkdownAr"
                    value={formData.summaryMarkdownAr}
                    onChange={(e) => handleChange('summaryMarkdownAr', e.target.value)}
                    placeholder="# ملخص المحاضرة\n\nالنقاط الرئيسية..."
                    rows={6}
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hebrew Tab */}
          <TabsContent value="he" className="space-y-6">
            <Card dir="rtl">
              <CardHeader>
                <CardTitle>תוכן עברי</CardTitle>
                <CardDescription>מידע על ההרצאה בעברית</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="titleHe">כותרת</Label>
                  <Input
                    id="titleHe"
                    value={formData.titleHe}
                    onChange={(e) => handleChange('titleHe', e.target.value)}
                    placeholder="מבוא לאלגברה"
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="descriptionHe">תיאור</Label>
                  <Textarea
                    id="descriptionHe"
                    value={formData.descriptionHe}
                    onChange={(e) => handleChange('descriptionHe', e.target.value)}
                    placeholder="תיאור קצר של ההרצאה..."
                    rows={3}
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrlHe">קישור וידאו</Label>
                  <Input
                    id="videoUrlHe"
                    type="url"
                    value={formData.videoUrlHe}
                    onChange={(e) => handleChange('videoUrlHe', e.target.value)}
                    placeholder="https://example.com/video-he.mp4"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="captionsUrlHe">קישור כתוביות</Label>
                  <Input
                    id="captionsUrlHe"
                    type="url"
                    value={formData.captionsUrlHe}
                    onChange={(e) => handleChange('captionsUrlHe', e.target.value)}
                    placeholder="https://example.com/captions-he.vtt"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="summaryMarkdownHe">סיכום</Label>
                  <Textarea
                    id="summaryMarkdownHe"
                    value={formData.summaryMarkdownHe}
                    onChange={(e) => handleChange('summaryMarkdownHe', e.target.value)}
                    placeholder="# סיכום ההרצאה\n\nנקודות מפתח..."
                    rows={6}
                    dir="rtl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Settings Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('lectures.settings')}</CardTitle>
            <CardDescription>{t('lectures.settingsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="durationSec">{t('lectures.duration')} (seconds)</Label>
                <Input
                  id="durationSec"
                  type="number"
                  min="0"
                  value={formData.durationSec}
                  onChange={(e) => handleChange('durationSec', parseInt(e.target.value) || 0)}
                  placeholder="1800"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.durationSec > 0 && `≈ ${Math.floor(formData.durationSec / 60)} ${t('common.minutes')}`}
                </p>
              </div>
              <div>
                <Label htmlFor="order">{t('lectures.order')}</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={formData.order}
                  onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
                  placeholder="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-8">
          <Link href={`/teacher/units/${unitId}/lectures`}>
            <Button type="button" variant="outline">
              {t('common.cancel')}
            </Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </div>
  );
}

