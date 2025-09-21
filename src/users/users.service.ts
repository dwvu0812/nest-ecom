import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResourceException } from '../shared/exceptions';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async markEmailVerified(userId: number, when: Date = new Date()) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: when },
    });
  }

  async getDefaultUserRoleId(): Promise<number> {
    const role = await this.prisma.role.findFirst({ where: { name: 'user' } });
    if (!role) throw ResourceException.notFound('Default user role');
    return role.id;
  }

  async createUser(params: {
    email: string;
    name: string;
    password: string;
    phoneNumber: string;
  }) {
    const roleId = await this.getDefaultUserRoleId();
    return this.prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        password: params.password,
        phoneNumber: params.phoneNumber,
        roleId,
        emailVerifiedAt: null,
      },
    });
  }
}
