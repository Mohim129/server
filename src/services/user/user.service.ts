import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { UserRole, UserStatus } from '@prisma/client';

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  status?: UserStatus;
}

export class UserService {
  static async getAllUsers(filters: { role?: UserRole; status?: UserStatus } = {}) {
    const whereClause: any = { isDeleted: false };
    
    if (filters.role) whereClause.role = filters.role;
    if (filters.status) whereClause.status = filters.status;

    return prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  static async updateUser(id: string, data: UpdateUserDTO) {
    // Verify user exists and is not deleted
    await this.getUserById(id);

    const updateData: any = { ...data };

    // Hash password if updating
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    // Check unique email if updating
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });
      if (existingUser) {
        const error: any = new Error('Email is already in use');
        error.statusCode = 400;
        throw error;
      }
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async deleteUser(id: string) {
    // Verify user exists and is not deleted
    await this.getUserById(id);

    // Perform soft delete
    return prisma.user.update({
      where: { id },
      data: { isDeleted: true },
      select: {
        id: true,
        name: true,
        email: true,
        isDeleted: true,
      },
    });
  }
}
