import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function VerifyEmailPage() {
  const [signingOut, setSigningOut] = useState(true);

  useEffect(() => {
    // Sign out the auto-created session from the email confirmation link
    // so the user starts fresh from the login page
    supabase.auth.signOut().finally(() => setSigningOut(false));
  }, []);

  if (signingOut) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Email Verified!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Your email has been confirmed successfully. You can now sign in to your account.
          It is safe to close this page.
        </p>
        <Link
          to="/login"
          className="inline-block w-full bg-blue-500 text-white py-2.5 rounded-lg font-medium hover:bg-blue-600 text-center"
        >
          Go to Sign In
        </Link>
      </div>
    </div>
  );
}
