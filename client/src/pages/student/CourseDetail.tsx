import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Clock, FileText, Gamepad2, PlayCircle } from "lucide-react";
import { toast } from "sonner";

export default function CourseDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const courseId = parseInt(id!);
  
  const utils = trpc.useUtils();
  const { data: courseData, isLoading } = trpc.courses.get.useQuery({ id: courseId });
  const course = courseData?.course;
  const units = courseData?.units;
  // Units are already fetched with course
  const { data: enrollments } = trpc.enrollment.myEnrollments.useQuery();
  // TODO: Implement progress tracking per course
  
  const enrollMutation = trpc.enrollment.enroll.useMutation({
    onSuccess: () => {
      utils.enrollment.myEnrollments.invalidate();
      toast.success(t('courses.enrollSuccess'));
    },
    onError: (error) => {
      toast.error(error.message || t('courses.enrollError'));
    },
  });

  const isEnrolled = enrollments?.some(e => e.enrollment.courseId === courseId);
  
  // Calculate progress - TODO: implement
  const completedLectures = 0;
  const totalLectures = 0;
  const progressPercent = 0;

  const handleEnroll = () => {
    enrollMutation.mutate({ courseId });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full mb-4" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-8">
        <p>{t('errors.notFound')}</p>
      </div>
    );
  }

  // Get localized content
  const lang = i18n.language;
  const title = lang === 'ar' ? (course.titleAr || course.title) : 
                lang === 'he' ? (course.titleHe || course.title) : 
                course.title;
  const description = lang === 'ar' ? (course.descriptionAr || course.description) : 
                      lang === 'he' ? (course.descriptionHe || course.description) : 
                      course.description;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <Link href="/student">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-muted-foreground">{description}</p>
            </div>
            {!isEnrolled && (
              <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
                {enrollMutation.isPending ? t('common.loading') : t('courses.enroll')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">{t('analytics.overview')}</TabsTrigger>
                <TabsTrigger value="content">{t('courses.units')}</TabsTrigger>
                <TabsTrigger value="resources">{t('lectures.references')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* Thumbnail */}
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                {/* Learning Outcomes */}
                {course.learningOutcomes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('courses.learningOutcomes')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{course.learningOutcomes}</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Prerequisites */}
                {course.prerequisites && (
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('courses.prerequisites')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{course.prerequisites}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="content" className="space-y-4">
                {units && units.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {units.map((unit, idx) => {
                      const unitTitle = lang === 'ar' ? (unit.titleAr || unit.title) :
                                       lang === 'he' ? (unit.titleHe || unit.title) :
                                       unit.title;
                      
                      return (
                        <AccordionItem key={unit.id} value={`unit-${unit.id}`}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">
                                {t('units.unit')} {idx + 1}:
                              </span>
                              <span>{unitTitle}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 pl-4">
                              {(unit as any).lectures?.map((lecture: any) => {
                                const lectureTitle = lang === 'ar' ? (lecture.titleAr || lecture.title) :
                                                    lang === 'he' ? (lecture.titleHe || lecture.title) :
                                                    lecture.title;
                                const isCompleted = false; // TODO: implement progress tracking
                                
                                return (
                                  <Link
                                    key={lecture.id}
                                    href={`/student/lecture/${lecture.id}`}
                                  >
                                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                                      {isCompleted ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                      )}
                                      <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                      <span className="flex-1">{lectureTitle}</span>
                                      {lecture.duration && (
                                        <span className="text-sm text-muted-foreground">
                                          {lecture.duration} min
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                );
                              })}
                              
                              {/* Games section - to be implemented */}
                              {false && (
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm font-semibold mb-2">{t('games.title')}</p>
                                  {(unit as any).games?.map((game: any) => (
                                    <Link
                                      key={game.id}
                                      href={`/student/game/${game.id}`}
                                    >
                                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer">
                                        <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                                        <span className="flex-1">{game.title}</span>
                                        <Badge variant={game.required ? "default" : "secondary"}>
                                          {t(`games.${game.required ? 'required' : 'optional'}`)}
                                        </Badge>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t('units.noUnits')}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('lectures.references')}</CardTitle>
                    <CardDescription>
                      Additional resources and materials for this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-5 w-5" />
                      <span>No resources available yet</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            {isEnrolled && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('progress.courseProgress')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t('progress.lecturesCompleted')}</span>
                      <span className="font-semibold">{completedLectures}/{totalLectures}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{Math.round(progressPercent)}%</p>
                    <p className="text-sm text-muted-foreground">{t('progress.overall')}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('courses.courseDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('courses.estimatedDuration')}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.estimatedDuration || 0} minutes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t('courses.units')}</p>
                    <p className="text-sm text-muted-foreground">
                      {units?.length || 0} {t('courses.units').toLowerCase()}
                    </p>
                  </div>
                </div>
                
                {course.tags && course.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">{t('courses.tags')}</p>
                    <div className="flex flex-wrap gap-2">
                      {course.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

