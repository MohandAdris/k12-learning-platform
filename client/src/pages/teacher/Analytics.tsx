import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

export default function Analytics() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Fetch analytics overview
  const { data: analytics, isLoading } = trpc.analytics.overview.useQuery({ range: dateRange });

  // Fetch teacher's courses
  const { data: courses = [] } = trpc.courses.list.useQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const stats = analytics || {
    courseCount: 0,
    studentCount: 0,
    schoolCount: 0,
    dau: 0,
    mau: 0,
    averageWatchTime: 0,
    completionRate: 0,
    gamePlayRate: 0,
  };

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/teacher">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('teacher.analytics')}</h1>
            <p className="text-muted-foreground mt-1">{t('teacher.analyticsSubtitle')}</p>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-8 max-w-xs">
        <label className="text-sm font-medium mb-2 block">{t('analytics.dateRange')}</label>
        <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{t('analytics.last7Days')}</SelectItem>
            <SelectItem value="30d">{t('analytics.last30Days')}</SelectItem>
            <SelectItem value="90d">{t('analytics.last90Days')}</SelectItem>
            <SelectItem value="1y">{t('analytics.lastYear')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalCourses')}</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courseCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.activeCourses')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.totalStudents')}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.mau} {t('analytics.monthlyActive')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.completionRate')}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.averageCompletion')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('analytics.avgWatchTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats.averageWatchTime / 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              {t('analytics.perStudent')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.engagement')}</CardTitle>
            <CardDescription>{t('analytics.engagementDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('analytics.dailyActiveUsers')}</span>
                <span className="text-sm text-muted-foreground">{stats.dau}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.dau / Math.max(stats.studentCount, 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('analytics.monthlyActiveUsers')}</span>
                <span className="text-sm text-muted-foreground">{stats.mau}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(stats.mau / Math.max(stats.studentCount, 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('analytics.gamePlayRate')}</span>
                <span className="text-sm text-muted-foreground">{stats.gamePlayRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${stats.gamePlayRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.yourCourses')}</CardTitle>
            <CardDescription>{t('analytics.yourCoursesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{t('analytics.noCourses')}</p>
                <Link href="/teacher/courses/create">
                  <Button className="mt-4">{t('courses.createCourse')}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course: any) => (
                  <Link key={course.id} href={`/teacher/courses/${course.id}/edit`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                      <div className="flex-1">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.visibility === 'PUBLIC' ? t('common.published') : t('common.draft')}
                        </p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.quickActions')}</CardTitle>
          <CardDescription>{t('analytics.quickActionsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/teacher/courses/create">
              <Button variant="outline" className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('courses.createCourse')}
              </Button>
            </Link>
            <Link href="/teacher/students">
              <Button variant="outline" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                {t('teacher.viewStudents')}
              </Button>
            </Link>
            <Link href="/teacher">
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('teacher.dashboard')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

