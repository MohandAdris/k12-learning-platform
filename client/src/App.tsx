import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TeacherHome from "./pages/teacher/TeacherHome";
import CourseCreate from "./pages/teacher/CourseCreate";
import CourseEdit from "./pages/teacher/CourseEdit";
import CourseUnits from "./pages/teacher/CourseUnits";
import UnitLectures from "./pages/teacher/UnitLectures";
import LectureForm from "./pages/teacher/LectureForm";
import Analytics from "./pages/teacher/Analytics";
import Students from "./pages/teacher/Students";
import LecturePage from "./pages/student/LecturePage";
import StudentHome from "./pages/student/StudentHome";
import CourseDetail from "./pages/student/CourseDetail";
import StudentProfile from "./pages/student/StudentProfile";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/teacher"} component={TeacherHome} />
      <Route path={"/teacher/courses/create"} component={CourseCreate} />
      <Route path={"/teacher/courses/:id/edit"} component={CourseEdit} />
      <Route path={"/teacher/courses/:id/units"} component={CourseUnits} />
      <Route path={"/teacher/units/:unitId/lectures"} component={UnitLectures} />
      <Route path={"/teacher/units/:unitId/lectures/create"} component={LectureForm} />
      <Route path={"/teacher/lectures/:lectureId/edit"} component={LectureForm} />
      <Route path={"/teacher/analytics"} component={Analytics} />
      <Route path={"/teacher/students"} component={Students} />
      <Route path={"/student"} component={StudentHome} />
      <Route path={"/student/course/:id"} component={CourseDetail} />
      <Route path={"/student/lecture/:id"} component={LecturePage} />
      <Route path={"/student/profile"} component={StudentProfile} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
