import { FaCheckCircle } from 'react-icons/fa';
import { FormValues } from '../validationSchema';

interface Step3SuccessProps {
  userInfo: FormValues;
}

const Step3Success = ({ userInfo }: Step3SuccessProps) => {
  return (
    <div className="text-center space-y-4">
      <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
      <h2 className="text-2xl font-bold text-white">
        Profile Completed Successfully!
      </h2>
      <p className="text-gray-400">Redirecting you to the dashboard...</p>

      <div className="mt-6 text-left bg-gray-800 p-4 rounded-md shadow-md">
        <h3 className="text-lg font-semibold mb-2">Your Information</h3>
        <div className="text-gray-300 space-y-1">
          <p>
            <strong>Full Name:</strong> {userInfo.fullName}
          </p>
          <p>
            <strong>Email:</strong> {userInfo.email}
          </p>
          <p>
            <strong>Username:</strong> {userInfo.username}
          </p>
          <p>
            <strong>Phone:</strong> {userInfo.phoneNumber}
          </p>
          <p>
            <strong>Role:</strong> {userInfo.role}
          </p>
          {userInfo.bio && (
            <p>
              <strong>Bio:</strong> {userInfo.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3Success;
