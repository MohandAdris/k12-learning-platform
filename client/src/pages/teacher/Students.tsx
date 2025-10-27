import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, User, Mail, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

export default function Students() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all users with role STUDENT
  const { data: students = [], isLoading } = trpc.users.list.useQuery({
    role: 'STUDENT',
    limit: 100,
  });

  // Filter students based on search query
  const filteredStudents = students.filter((student: any) =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold">{t('students.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('students.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('students.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{filteredStudents.length}</p>
              <p className="text-sm text-muted-foreground">{t('students.totalStudents')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('students.studentList')}</CardTitle>
          <CardDescription>{t('students.studentListDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">{t('students.noStudents')}</p>
              <p className="text-muted-foreground">{t('students.noStudentsDescription')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('students.name')}</TableHead>
                    <TableHead>{t('students.email')}</TableHead>
                    <TableHead>{t('students.school')}</TableHead>
                    <TableHead>{t('students.enrollments')}</TableHead>
                    <TableHead>{t('students.progress')}</TableHead>
                    <TableHead>{t('students.joinedDate')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{student.name || t('common.unknown')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{student.email || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.schoolName || t('students.noSchool')}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">-</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: '0%' }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">0%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(student.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/teacher/students/${student.id}`}>
                          <Button variant="ghost" size="sm">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            {t('students.viewDetails')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

