import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";

/**
 * All content in this page are only for example, delete if unneeded
 * When building pages, remember your instructions in Frontend Workflow, Frontend Best Practices, Design Guide and Common Pitfalls
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Redirect authenticated users to student portal
  if (isAuthenticated && user) {
    window.location.href = '/student';
    return null;
  }

  // If theme is switchable in App.tsx, we can implement theme toggling like this:
  // const { theme, toggleTheme } = useTheme();

  // Use APP_LOGO (as image src) and APP_TITLE if needed

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <div className="flex items-center justify-center mb-8">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-16 w-16 mr-4" />
          <h1 className="text-4xl font-bold text-gray-900">{APP_TITLE}</h1>
        </div>
        
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          A comprehensive K-12 learning platform supporting English, Arabic, and Hebrew
        </p>
        
        {loading ? (
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
        ) : (
          <div className="space-y-4">
            <a href={getLoginUrl()}>
              <Button size="lg" className="px-8 py-6 text-lg">
                Get Started
              </Button>
            </a>
            <p className="text-sm text-gray-500">
              Sign in to access your courses and learning materials
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
