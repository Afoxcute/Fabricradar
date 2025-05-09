import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const ProfileTab: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-gray-400 text-sm">First Name</h3>
            <p className="font-medium">{user?.firstName || '(Not provided)'}</p>
          </div>

          <div>
            <h3 className="text-gray-400 text-sm">Last Name</h3>
            <p className="font-medium">{user?.lastName || '(Not provided)'}</p>
          </div>

          <div>
            <h3 className="text-gray-400 text-sm">Email</h3>
            <p className="font-medium">{user?.email || '(Not provided)'}</p>
          </div>

          <div>
            <h3 className="text-gray-400 text-sm">Phone</h3>
            <p className="font-medium">{user?.phone || '(Not provided)'}</p>
          </div>
        </div>

        <div className="mt-6">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
