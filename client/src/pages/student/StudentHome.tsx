import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { BookOpen, Clock, Search, GraduationCap } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function StudentHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const { data: courses, isLoading } = trpc.courses.list.useQuery({});
  const { data: enrollments } = trpc.enrollment.myEnrollments.useQuery();

  const enrolledCourseIds = new Set(enrollments?.map(e => e.enrollment.courseId) || []);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">
                {t('auth.welcome')}, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('courses.searchCourses')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link href="/student/progress">
                <Button variant="outline">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  {t('progress.title')}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('courses.searchCourses')}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* My Courses Section */}
      {enrollments && enrollments.length > 0 && (
        <div className="container py-8">
          <h2 className="text-2xl font-bold mb-6">{t('courses.myCourses')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map(({ enrollment, course }) => {
              if (!course) return null;
              
              return (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Badge variant={enrollment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {t(`courses.${enrollment.status.toLowerCase()}`)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.estimatedDuration || 0} {t('courses.duration')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/course/${course.id}`} className="w-full">
                      <Button className="w-full">
                        {t('progress.continueWhere')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Courses Section */}
      <div className="container py-8">
        <h2 className="text-2xl font-bold mb-6">{t('courses.allCourses')}</h2>
        {courses && courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('courses.noCourses')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map(course => {
              const isEnrolled = enrolledCourseIds.has(course.id);
              
              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-40 object-cover rounded-md mb-4"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.estimatedDuration || 0} min</span>
                      </div>
                    </div>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {course.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/course/${course.id}`} className="w-full">
                      <Button className="w-full" variant={isEnrolled ? "default" : "outline"}>
                        {isEnrolled ? t('courses.enrolled') : t('courses.enroll')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

