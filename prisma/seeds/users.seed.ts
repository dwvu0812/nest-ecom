import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role, User } from '../../generated/prisma';

export async function seedUsers(
  prisma: PrismaClient,
  roles: { adminRole: Role; managerRole: Role; userRole: Role },
): Promise<{
  adminUser: User;
  managerUser: User;
  normalUser: User;
}> {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      phoneNumber: '+84123456789',
      avatar: 'https://via.placeholder.com/150',
      status: 'ACTIVE',
      roleId: roles.adminRole.id,
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: hashedPassword,
      phoneNumber: '+84987654321',
      avatar: 'https://via.placeholder.com/150',
      status: 'ACTIVE',
      roleId: roles.managerRole.id,
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Normal User',
      password: hashedPassword,
      phoneNumber: '+84111222333',
      avatar: 'https://via.placeholder.com/150',
      status: 'ACTIVE',
      roleId: roles.userRole.id,
    },
  });

  // Tạo User Translations
  const languages = await prisma.language.findMany();
  const vietnamese = languages.find((l) => l.code === 'vi');
  const english = languages.find((l) => l.code === 'en');

  if (vietnamese) {
    await prisma.userTranslation.createMany({
      data: [
        {
          userId: adminUser.id,
          languageId: vietnamese.id,
          address: '123 Đường ABC, Quận 1, TP.HCM',
          description: 'Quản trị viên hệ thống',
        },
        {
          userId: managerUser.id,
          languageId: vietnamese.id,
          address: '456 Đường XYZ, Quận 2, TP.HCM',
          description: 'Quản lý cửa hàng',
        },
        {
          userId: normalUser.id,
          languageId: vietnamese.id,
          address: '789 Đường DEF, Quận 3, TP.HCM',
          description: 'Khách hàng thường xuyên',
        },
      ],
    });
  }

  if (english) {
    await prisma.userTranslation.create({
      data: {
        userId: adminUser.id,
        languageId: english.id,
        address: '123 ABC Street, District 1, HCMC',
        description: 'System Administrator',
      },
    });
  }

  return { adminUser, managerUser, normalUser };
}
