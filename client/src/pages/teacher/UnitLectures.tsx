import { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function UnitLectures() {
  const { unitId } = useParams();
  const [, navigate] = useLocation();
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);

  // Fetch unit details
  const { data: unit, isLoading: unitLoading } = trpc.units.get.useQuery(
    { id: Number(unitId) },
    { enabled: !!unitId }
  );

  // Fetch lectures for this unit
  const { data: lectures = [], isLoading: lecturesLoading, refetch } = trpc.lectures.list.useQuery(
    { unitId: Number(unitId) },
    { enabled: !!unitId }
  );

  // Delete lecture mutation
  const deleteLecture = trpc.lectures.delete.useMutation({
    onSuccess: () => {
      toast.success(t('lectures.deleteSuccess'));
      refetch();
    },
    onError: (error) => {
      toast.error(t('common.error') + ': ' + error.message);
    },
  });

  const handleDelete = async (lectureId: number, lectureName: string) => {
    if (confirm(t('lectures.deleteConfirmation', { name: lectureName }))) {
      await deleteLecture.mutateAsync({ id: lectureId });
    }
  };

  if (unitLoading || lecturesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="container mx-auto py-8">
        <p>{t('common.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('lectures.manageLectures')}</h1>
            <p className="text-muted-foreground mt-1">
              {unit.unit.title || unit.unit.titleAr || unit.unit.titleHe}
            </p>
          </div>
        </div>
        <Link href={`/teacher/units/${unitId}/lectures/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t('lectures.createLecture')}
          </Button>
        </Link>
      </div>

      {/* Lectures List */}
      {lectures.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('lectures.noLectures')}</h3>
            <p className="text-muted-foreground mb-4">{t('lectures.noLecturesDescription')}</p>
            <Link href={`/teacher/units/${unitId}/lectures/create`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('lectures.createFirstLecture')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lectures
            .sort((a: any, b: any) => a.order - b.order)
            .map((lecture: any, index: number) => (
              <Card key={lecture.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 cursor-move text-muted-foreground">
                        <GripVertical className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {t('lectures.lecture')} {index + 1}: {lecture.titleEn || lecture.titleAr || lecture.titleHe}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {lecture.summaryEn || lecture.summaryAr || lecture.summaryHe}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {lecture.durationSec && (
                            <span>⏱️ {Math.floor(lecture.durationSec / 60)} {t('common.minutes')}</span>
                          )}
                          {lecture.videoUrl && (
                            <span>🎥 {t('lectures.hasVideo')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/teacher/lectures/${lecture.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          {t('common.edit')}
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(lecture.id, lecture.titleEn || lecture.titleAr || lecture.titleHe || '')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

