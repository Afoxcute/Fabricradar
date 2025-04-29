import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// Address interface for JSON fields
export interface AddressData {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  homeAddress?: AddressData;

  @IsOptional()
  deliveryAddress?: AddressData;

  // Profile picture will be handled separately in multipart form data
}
