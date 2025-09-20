import { PrismaClient, Permission } from '@prisma/client';

export async function seedPermissions(
  prisma: PrismaClient,
): Promise<Permission[]> {
  const permissionData = [
    {
      name: 'Quản lý người dùng',
      description: 'Xem, tạo, sửa, xóa người dùng',
      path: '/users',
      method: 'GET' as const,
    },
    {
      name: 'Tạo người dùng',
      description: 'Tạo người dùng mới',
      path: '/users',
      method: 'POST' as const,
    },
    {
      name: 'Cập nhật người dùng',
      description: 'Cập nhật thông tin người dùng',
      path: '/users',
      method: 'PUT' as const,
    },
    {
      name: 'Xóa người dùng',
      description: 'Xóa người dùng',
      path: '/users',
      method: 'DELETE' as const,
    },
    {
      name: 'Quản lý sản phẩm',
      description: 'Xem danh sách sản phẩm',
      path: '/products',
      method: 'GET' as const,
    },
    {
      name: 'Tạo sản phẩm',
      description: 'Tạo sản phẩm mới',
      path: '/products',
      method: 'POST' as const,
    },
    {
      name: 'Cập nhật sản phẩm',
      description: 'Cập nhật thông tin sản phẩm',
      path: '/products',
      method: 'PUT' as const,
    },
    {
      name: 'Xóa sản phẩm',
      description: 'Xóa sản phẩm',
      path: '/products',
      method: 'DELETE' as const,
    },
    {
      name: 'Quản lý đơn hàng',
      description: 'Xem danh sách đơn hàng',
      path: '/orders',
      method: 'GET' as const,
    },
    {
      name: 'Cập nhật đơn hàng',
      description: 'Cập nhật trạng thái đơn hàng',
      path: '/orders',
      method: 'PUT' as const,
    },
  ];

  const permissions: Permission[] = [];

  for (const data of permissionData) {
    const permission = await prisma.permission.create({ data });
    permissions.push(permission);
  }

  return permissions;
}
