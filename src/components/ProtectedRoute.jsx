import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { useToast } from './ui/use-toast';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle admin access denial
  useEffect(() => {
    if (!loading && isAuthenticated && requireAdmin && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges to access this page.",
        variant: "destructive",
      });
      setShouldRedirect(true);
      // Small delay to show the toast before redirecting
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, requireAdmin, isAdmin, toast, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If not authenticated, show login modal
  if (!isAuthenticated) {
    return (
      <AuthModal
        open={true}
        onOpenChange={setShowAuthModal}
        onSuccess={() => setShowAuthModal(false)}
      />
    );
  }

  // If admin route but user is not admin, show loading while redirecting
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized, render the protected content
  return children;
};

export default ProtectedRoute;