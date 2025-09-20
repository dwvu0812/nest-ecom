import { PrismaClient, Role, Permission } from '@prisma/client';

export async function seedRoles(
  prisma: PrismaClient,
  permissions: Permission[],
): Promise<{
  adminRole: Role;
  managerRole: Role;
  userRole: Role;
}> {
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Quản trị viên hệ thống',
      isActive: true,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: 'manager',
      description: 'Quản lý cửa hàng',
      isActive: true,
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'user',
      description: 'Người dùng thông thường',
      isActive: true,
    },
  });

  // Admin có tất cả quyền
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        connect: permissions.map((p) => ({ id: p.id })),
      },
    },
  });

  // Manager có quyền quản lý sản phẩm và đơn hàng
  const managerPermissions = permissions.filter(
    (p) => p.path.includes('/products') || p.path.includes('/orders'),
  );

  await prisma.role.update({
    where: { id: managerRole.id },
    data: {
      permissions: {
        connect: managerPermissions.map((p) => ({ id: p.id })),
      },
    },
  });

  // User role không có permission đặc biệt

  return { adminRole, managerRole, userRole };
}
