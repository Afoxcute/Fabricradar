export interface BasicUserInfo {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
}

export interface VendorInfo {
  businessName: string;
  businessType: string;
  businessAddress: string;
  businessDescription: string;
}

export type UserRole = 'vendor' | 'user';

export interface FormData extends BasicUserInfo {
  role: UserRole;
  vendorInfo?: VendorInfo;
}
