import * as Yup from 'yup';

export interface FormValues {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  bio: string;
  role: 'user' | 'vendor';
  businessName?: string;
  specialization?: string;
  businessDescription?: string;
}

export const formSchema = Yup.object().shape({
  // Basic info fields - always required
  fullName: Yup.string().required('Full name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string(),
  bio: Yup.string(),
  role: Yup.string().oneOf(['user', 'vendor']).required('Please select a role'),

  // Vendor fields - conditionally required
  businessName: Yup.string().when('role', {
    is: 'vendor',
    then: (schema) => schema.required('Business name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  specialization: Yup.string().when('role', {
    is: 'vendor',
    then: (schema) => schema.required('Specialization is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  businessDescription: Yup.string().when('role', {
    is: 'vendor',
    then: (schema) => schema.required('Business description is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});
