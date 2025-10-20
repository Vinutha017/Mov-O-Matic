import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect if we're not loading and there's definitely no user
    if (!loading && currentUser === null) {
      console.log('🔒 No authenticated user, redirecting to login');
      setLocation('/login');
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

  // Show content if user is authenticated
  if (currentUser) {
    console.log('✅ User authenticated, showing protected content');
    return <>{children}</>;
  }

  // Show loading while redirecting (shouldn't be visible for long)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}