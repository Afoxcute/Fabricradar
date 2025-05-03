import { Input } from '@/components/Input';
import { SelectInput } from '@/components/SelectInput';
import { TextArea } from '@/components/TextArea';
import { Button } from '@/components/ui/button';
import { useFormikContext } from 'formik';
import React, { Dispatch, SetStateAction } from 'react';
import { FaUser } from 'react-icons/fa';
import { RiStore2Line } from 'react-icons/ri';
import { FormData } from 'types';

interface IStep2SelectRole {
  selectedRole: 'user' | 'vendor';
  onSelect: (role: 'user' | 'vendor') => void;
  onBack: () => void;
  onSubmit: () => void;
}

const Step2SelectRole = ({
  selectedRole,
  onSelect,
  onBack,
  onSubmit,
}: IStep2SelectRole) => {
  return (
    <>
      <div>
        <h3 className="text-xl font-semibold">Choose Your Role</h3>
        <p className="text-sm text-gray-300">
          Select how you want to use Tailor Module
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => onSelect('user')}
          className={`group relative p-6 rounded-lg border transition-all duration-200 hover:border-cyan-500/50 ${
            selectedRole === 'user'
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-gray-700'
          }`}
        >
          <div className="absolute top-4 right-4">
            <FaUser className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="pt-8">
            <h3 className="text-xl font-bold mb-2">User</h3>
            <p className="text-gray-400 text-sm">Browse and purchase items</p>
            <ul className="mt-4 text-sm text-gray-400 space-y-2">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />
                Browse products
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />
                Make purchases
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />
                Track orders
              </li>
            </ul>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('vendor')}
          className={`group relative p-6 rounded-lg border transition-all duration-200 hover:border-cyan-500/50 ${
            selectedRole === 'vendor'
              ? 'border-cyan-500 bg-cyan-500/10'
              : 'border-gray-700'
          }`}
        >
          <div className="absolute top-4 right-4">
            <RiStore2Line className="w-6 h-6 text-cyan-500" />
          </div>
          <div className="pt-8">
            <h3 className="text-xl font-bold mb-2">Vendor</h3>
            <p className="text-gray-400 text-sm">Sell products and services</p>
            <ul className="mt-4 text-sm text-gray-400 space-y-2">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />
                Manage inventory
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />
                Process orders
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2" />
                Track analytics
              </li>
            </ul>
          </div>
        </button>
      </div>
      {selectedRole === 'vendor' && (
        <div className="mt-6 grid gap-4">
          <Input
            name="businessName"
            label="Business Name"
            placeholder="Your business name"
          />
          <SelectInput
            name="specialization"
            label="Specializations"
            options={[
              { label: 'Ready-to-Wear (RTW)', value: 'ready_to_wear' },
              { label: 'Custom Tailoring', value: 'custom_tailoring' },
              { label: 'Bridal Wear', value: 'bridal_wear' },
              { label: 'Menswear', value: 'menswear' },
              { label: 'Womenswear', value: 'womenswear' },
              { label: 'Kidswear', value: 'kidswear' },
              { label: 'Streetwear', value: 'streetwear' },
              { label: 'Haute Couture', value: 'haute_couture' },
              { label: 'Uniform Production', value: 'uniform_production' },
              {
                label: 'Accessories (bags, jewelry, etc.)',
                value: 'accessories',
              },
              { label: 'Footwear', value: 'footwear' },
              { label: 'Fashion Styling', value: 'fashion_styling' },
              { label: 'Fashion Illustration', value: 'fashion_illustration' },
              { label: 'Textile Design', value: 'textile_design' },
              { label: 'Ethnic/Traditional Wear', value: 'ethnic_wear' },
              { label: 'Sustainable Fashion', value: 'sustainable_fashion' },
              { label: 'Plus Size Fashion', value: 'plus_size_fashion' },
              { label: 'Maternity Wear', value: 'maternity_wear' },
              { label: 'Swimwear / Resort Wear', value: 'swimwear' },
              { label: 'Lingerie / Intimates', value: 'lingerie' },
            ]}
          />
          <TextArea
            name="businessDescription"
            label="Business Description"
            placeholder="Describe your business"
          />
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button type="button" onClick={onBack} variant="outline">
          Back
        </Button>
        <Button type="submit" onClick={onSubmit} disabled={!selectedRole}>
          {selectedRole === 'user' ? 'Complete' : 'Continue'}
        </Button>
      </div>
    </>
  );
};

export default Step2SelectRole;
