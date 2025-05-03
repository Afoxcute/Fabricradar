import React from 'react';

interface StepProgressProps {
  currentStep: number;
}

const StepProgress = ({ currentStep }: StepProgressProps) => {
  const steps = ['Info', 'Role', 'Done'];
  return (
    <div className="flex items-center justify-between max-w-xs mx-auto mb-8">
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= i + 1 ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{i + 1}</span>
            </div>
            <span className="text-xs mt-1 text-gray-400">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 ${
                currentStep >= i + 2 ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepProgress;
