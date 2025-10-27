import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Award, BookOpen, Download, Edit2, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { toast } from "sonner";

export default function StudentProfile() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ar' | 'he'>('en');

  // Fetch enrollments
  const { data: enrollments = [] } = trpc.enrollment.myEnrollments.useQuery();

  // Fetch progress for all enrollments
  const { data: allProgress = [] } = trpc.progress.myProgress.useQuery();

  // Update user mutation
  const updateUser = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(t("profile.updated"));
      setIsEditing(false);
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setPreferredLanguage((user.preferredLanguage as 'en' | 'ar' | 'he') || "en");
    }
  }, [user]);

  const handleSave = () => {
    updateUser.mutate({
      firstName,
      lastName,
      email,
      preferredLanguage,
    });
  };

  const handleLanguageChange = (lang: 'en' | 'ar' | 'he') => {
    setPreferredLanguage(lang);
    i18n.changeLanguage(lang);
  };

  // For now, treat all enrollments as in-progress
  // TODO: Add proper completion tracking based on lecture progress
  const inProgressCourses = enrollments;
  const completedCourses: typeof enrollments = [];
  const notStartedCourses: typeof enrollments = [];

  const generateCertificate = (enrollment: typeof enrollments[0]) => {
    // Create a simple certificate HTML
    const certificateHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Georgia', serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .certificate {
            background: white;
            padding: 60px;
            border: 20px solid #f0f0f0;
            box-shadow: 0 0 50px rgba(0,0,0,0.3);
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 20px;
          }
          .subtitle {
            font-size: 24px;
            color: #666;
            margin-bottom: 40px;
          }
          .recipient {
            font-size: 36px;
            color: #333;
            margin: 30px 0;
            font-weight: bold;
          }
          .course {
            font-size: 28px;
            color: #667eea;
            margin: 20px 0;
            font-style: italic;
          }
          .date {
            font-size: 18px;
            color: #999;
            margin-top: 40px;
          }
          .signature {
            margin-top: 60px;
            border-top: 2px solid #333;
            display: inline-block;
            padding-top: 10px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Completion</h1>
          <div class="subtitle">This is to certify that</div>
          <div class="recipient">${user?.firstName} ${user?.lastName}</div>
          <div class="subtitle">has successfully completed the course</div>
          <div class="course">${enrollment.course?.title || "Course"}</div>
          <div class="date">Completed on ${new Date(enrollment.enrollment.createdAt).toLocaleDateString()}</div>
          <div class="signature">K-12 Learning Platform</div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([certificateHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${enrollment.course?.title?.replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(t("profile.certificateDownloaded"));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("profile.myProfile")}</h1>
          <p className="text-gray-600">{t("profile.manageAccount")}</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              {t("profile.personalInfo")}
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="w-4 h-4 mr-2" />
              {t("profile.myCourses")}
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award className="w-4 h-4 mr-2" />
              {t("profile.certificates")}
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("profile.personalInfo")}</CardTitle>
                    <CardDescription>{t("profile.updateYourInfo")}</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit2 className="w-4 h-4 mr-2" />
                      {t("common.edit")}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave} disabled={updateUser.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        {t("common.save")}
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline">
                        {t("common.cancel")}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t("profile.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t("profile.preferredLanguage")}</Label>
                  <Select
                    value={preferredLanguage}
                    onValueChange={handleLanguageChange}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="he">עברית</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">{t("profile.role")}</p>
                      <p className="font-medium">{user.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">{t("profile.memberSince")}</p>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {/* In Progress */}
            {inProgressCourses.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{t("profile.inProgress")}</h3>
                <div className="grid gap-4">
                  {inProgressCourses.map((enrollment: typeof enrollments[0]) => {
                    const completion = 0; // TODO: Calculate from lecture progress
                    return (
                      <Card key={enrollment.enrollment.id}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">
                                {enrollment.course?.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {enrollment.course?.description}
                              </p>
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span>{t("progress.progress")}</span>
                                  <span className="font-medium">{completion}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${completion}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            <Link href={`/student/course/${enrollment.enrollment.courseId}`}>
                              <Button className="ml-4">
                                {t("courses.continue")}
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Not Started */}
            {notStartedCourses.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{t("profile.notStarted")}</h3>
                <div className="grid gap-4">
                  {notStartedCourses.map((enrollment: typeof enrollments[0]) => (
                    <Card key={enrollment.enrollment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {enrollment.course?.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {enrollment.course?.description}
                            </p>
                          </div>
                          <Link href={`/student/course/${enrollment.enrollment.courseId}`}>
                            <Button variant="outline" className="ml-4">
                              {t("courses.start")}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Completed */}
            {completedCourses.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">{t("profile.completed")}</h3>
                <div className="grid gap-4">
                  {completedCourses.map((enrollment: typeof enrollments[0]) => (
                    <Card key={enrollment.enrollment.id} className="border-green-200 bg-green-50">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Award className="w-8 h-8 text-green-600" />
                            <div>
                              <h4 className="font-semibold text-lg">
                                {enrollment.course?.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {t("profile.completedOn")}{" "}
                                {new Date(enrollment.enrollment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={() => generateCertificate(enrollment)}
                            variant="outline"
                            className="ml-4"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {t("profile.downloadCertificate")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {enrollments.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("profile.noEnrollments")}</h3>
                  <p className="text-gray-600 mb-4">{t("profile.startLearning")}</p>
                  <Link href="/student">
                    <Button>{t("courses.browseCourses")}</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.myCertificates")}</CardTitle>
                <CardDescription>{t("profile.downloadCertificates")}</CardDescription>
              </CardHeader>
              <CardContent>
                {completedCourses.length > 0 ? (
                  <div className="space-y-4">
                    {completedCourses.map((enrollment: typeof enrollments[0]) => (
                      <div
                        key={enrollment.enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Award className="w-8 h-8 text-yellow-600" />
                          <div>
                            <h4 className="font-semibold">{enrollment.course?.title}</h4>
                            <p className="text-sm text-gray-600">
                              {t("profile.completedOn")}{" "}
                              {new Date(enrollment.enrollment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => generateCertificate(enrollment)}
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {t("common.download")}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("profile.noCertificates")}
                    </h3>
                    <p className="text-gray-600">{t("profile.completeCourses")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

