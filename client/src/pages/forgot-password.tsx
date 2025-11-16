import React, { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // Redirect URL after password reset
        handleCodeInApp: false
      });

      setEmailSent(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      let errorMessage = 'An error occurred while sending the reset email';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later';
          break;
        default:
          errorMessage = err.message || 'Failed to send reset email';
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });

      toast({
        title: "Email Resent",
        description: "Password reset email has been sent again.",
      });
    } catch (err: any) {
      setError('Failed to resend email. Please try again.');
      toast({
        title: "Error",
        description: "Failed to resend email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Login */}
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </Link>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardHeader className="space-y-1 pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                {emailSent ? (
                  <CheckCircle className="w-8 h-8 text-white" />
                ) : (
                  <Mail className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              {emailSent ? 'Check Your Email' : 'Forgot Password?'}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {emailSent ? (
                <>
                  We've sent password reset instructions to <strong>{email}</strong>
                </>
              ) : (
                "Enter your email address and we'll send you instructions to reset your password."
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Email
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Password reset email sent successfully! Check your inbox and spam folder.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  
                  <Button
                    variant="outline"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Resending...
                      </>
                    ) : (
                      'Resend Email'
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                      setError('');
                    }}
                    className="w-full text-gray-600"
                  >
                    Use Different Email
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/login">
                  <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700">
                    Sign in
                  </Button>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our{' '}
            <Button variant="link" className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700">
              support team
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}