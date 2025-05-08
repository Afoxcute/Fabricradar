import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import BackgroundEffect from '@/components/background-effect/background-effect';
import Header from '@/components/header/header';

interface AccessControlProps {
  children: React.ReactNode;
  requiredAccountType?: string;
}

const AccessControl: React.FC<AccessControlProps> = ({
  children,
  requiredAccountType,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050b18] to-[#0a1428]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="bg-blue-900/30 border border-blue-800 text-white px-6 py-8 rounded-lg flex flex-col items-center text-center max-w-2xl mx-auto">
            <AlertCircle size={48} className="text-blue-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Login Required</h1>
            <p className="text-gray-300 mb-6">
              Please log in to access the tailor dashboard.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-lg transition-colors"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (requiredAccountType && user.accountType !== requiredAccountType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative">
        <BackgroundEffect />
        <Header />

        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-900/30 border border-red-800 text-white px-6 py-8 rounded-lg flex flex-col items-center text-center max-w-2xl mx-auto">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-gray-300 mb-6">
              This area is only accessible to{' '}
              {requiredAccountType.toLowerCase()} accounts. Please contact
              support if you believe this is an error.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessControl;
