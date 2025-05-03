import { Input } from '@/components/Input';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/ui/button';

const Step1PersonalInfo = () => (
  <>
    <h3 className="text-xl font-semibold">Personal Information</h3>
    <p className="text-sm text-gray-300 mb-4">Tell us a bit about yourself</p>
    <div className="grid grid-cols-2 gap-6">
      <Input name="fullName" label="Full Name" placeholder="John Doe" />
      <Input name="username" label="Username" placeholder="johndoe" />
      <Input name="email" label="Email" type="email" />
      <Input name="phoneNumber" label="Phone Number" type="tel" />
    </div>
    <TextArea name="bio" placeholder="Bio (optional)" />
    <div className="w-full flex justify-end">
      <Button type="submit">Continue</Button>
    </div>
  </>
);
export default Step1PersonalInfo;
