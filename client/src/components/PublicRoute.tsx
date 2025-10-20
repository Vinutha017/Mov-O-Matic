import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute component for pages that should only be accessible to non-authenticated users
 * (like login and signup pages). Redirects authenticated users to the welcome page.
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're not loading and there's definitely a user
    if (!loading && currentUser) {
      console.log('👤 User already authenticated, redirecting to welcome');
      setLocation('/welcome');
    }
  }, [currentUser, loading, setLocation]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show content if user is not authenticated
  if (!currentUser) {
    console.log('🔓 User not authenticated, showing public content');
    return <>{children}</>;
  }

  // Show loading while redirecting (shouldn't be visible for long)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}