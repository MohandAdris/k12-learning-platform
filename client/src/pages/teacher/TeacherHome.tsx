import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, GraduationCap, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function TeacherHome() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  // Fetch teacher's courses
  const { data: courses } = trpc.courses.list.useQuery({ limit: 100 });
  
  // Fetch analytics overview
  const { data: analytics } = trpc.analytics.overview.useQuery({ range: '30d' });
  
  const stats = [
    {
      title: t("teacher.totalCourses"),
      value: courses?.length || 0,
      icon: BookOpen,
      description: t("teacher.coursesDescription"),
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: t("teacher.totalStudents"),
      value: analytics?.studentCount || 0,
      icon: Users,
      description: t("teacher.studentsDescription"),
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: t("teacher.activeEnrollments"),
      value: courses?.length || 0,
      icon: GraduationCap,
      description: t("teacher.enrollmentsDescription"),
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: t("teacher.avgCompletion"),
      value: `${Math.round((analytics?.completionRate || 0) * 100)}%`,
      icon: TrendingUp,
      description: t("teacher.completionDescription"),
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {t("teacher.welcome")}, {user?.firstName}!
              </h1>
              <p className="text-gray-600 mt-1">{t("teacher.dashboardSubtitle")}</p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Link href="/teacher/courses/create">
                <Button size="lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {t("teacher.createCourse")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Courses */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("teacher.myCourses")}</CardTitle>
                <CardDescription>{t("teacher.manageYourCourses")}</CardDescription>
              </div>
              <Link href="/teacher/courses">
                <Button variant="outline">{t("common.viewAll")}</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <Link key={course.id} href={`/teacher/courses/${course.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-4">
                        {course.thumbnailUrl && (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <p className="text-sm text-gray-600">{course.description?.substring(0, 100)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{t("teacher.status")}</p>
                          <p className="font-semibold">
                            {course.publishedAt ? t("common.published") : t("common.draft")}
                          </p>
                        </div>
                        <Link href={`/teacher/courses/${course.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            {t("common.edit")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("teacher.noCourses")}</h3>
                <p className="text-gray-600 mb-4">{t("teacher.createFirstCourse")}</p>
                <Link href="/teacher/courses/create">
                  <Button>{t("teacher.createCourse")}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/teacher/students">
              <CardHeader>
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <CardTitle>{t("teacher.manageStudents")}</CardTitle>
                <CardDescription>{t("teacher.viewAndManageStudents")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/teacher/analytics">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>{t("teacher.analytics")}</CardTitle>
                <CardDescription>{t("teacher.viewDetailedAnalytics")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/teacher/schools">
              <CardHeader>
                <GraduationCap className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>{t("teacher.schools")}</CardTitle>
                <CardDescription>{t("teacher.manageSchools")}</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}

