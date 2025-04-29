import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto, AddressData } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, profilePicturePath?: string) {
    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        fullName: createUserDto.fullName,
        phoneNumber: createUserDto.phoneNumber,
        homeAddress: createUserDto.homeAddress as any,
        deliveryAddress: createUserDto.deliveryAddress as any,
        profilePicture: profilePicturePath,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    profilePicturePath?: string,
  ) {
    // Check if user exists
    await this.findOne(id);

    // Prepare the update data
    const updateData: any = { ...updateUserDto };

    // Add profile picture path if provided
    if (profilePicturePath) {
      updateData.profilePicture = profilePicturePath;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateAddress(
    id: number,
    type: 'home' | 'delivery',
    addressData: AddressData,
  ) {
    // Check if user exists
    await this.findOne(id);

    const updateField = type === 'home' ? 'homeAddress' : 'deliveryAddress';

    return this.prisma.user.update({
      where: { id },
      data: {
        [updateField]: addressData as any,
      },
    });
  }

  async remove(id: number) {
    // Check if user exists
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
