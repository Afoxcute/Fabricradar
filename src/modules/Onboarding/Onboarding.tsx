'use client';
import Header from '@/components/header/header';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Step1PersonalInfo,
  Step2SelectRole,
  Step3Success,
  StepProgress,
} from './components';
import { formSchema, FormValues } from './validationSchema';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState<FormValues | null>(null);
  const router = useRouter();

  const handleComplete = async (values: FormValues) => {
    try {
      console.log('Submitting user data:', values);
      await new Promise((res) => setTimeout(res, 1000));

      setUserInfo(values); // Replace with real API response if available
      setStep(3);

      setTimeout(() => router.push('/dashboard'), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Header />
      <div className="max-w-[1440px] mx-auto mt-10 mb-6">
        {step !== 3 && (
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-gray-400">
              Let&apos;s set up your account to get the most out of Tailor
              Module
            </p>
          </div>
        )}

        <StepProgress currentStep={step} />

        <div className="w-full max-w-[700px] mx-auto border p-4 grid bg-gray-900/50 backdrop-blur-sm border-gray-800">
          <Formik
            initialValues={{
              role: 'user' as 'user' | 'vendor',
              fullName: '',
              username: '',
              email: '',
              phoneNumber: '',
              bio: '',
            }}
            validationSchema={formSchema}
            onSubmit={async (values) => {
              if (step === 1) setStep(2);
              else if (step === 2) {
                if (values.role === 'user') {
                  await handleComplete(values);
                } else setStep(3);
              }
            }}
          >
            {({ values, setFieldValue }) => (
              <Form className="grid gap-6">
                {step === 1 && <Step1PersonalInfo />}
                {step === 2 && (
                  <Step2SelectRole
                    selectedRole={values.role}
                    onSelect={(role) => setFieldValue('role', role)}
                    onBack={() => setStep(1)}
                    onSubmit={() => handleComplete}
                  />
                )}
                {step === 3 && <Step3Success userInfo={values} />}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
