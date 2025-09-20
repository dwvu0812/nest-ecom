import { PrismaClient, User } from '@prisma/client';

export async function seedMessages(
  prisma: PrismaClient,
  users: { adminUser: User; managerUser: User; normalUser: User },
): Promise<void> {
  await prisma.message.createMany({
    data: [
      {
        fromUserId: users.normalUser.id,
        toUserId: users.adminUser.id,
        content:
          'Xin chào, tôi có câu hỏi về sản phẩm iPhone 15. Bảo hành như thế nào?',
      },
      {
        fromUserId: users.adminUser.id,
        toUserId: users.normalUser.id,
        content:
          'Xin chào! iPhone 15 có bảo hành 1 năm chính hãng từ Apple. Bạn cần hỗ trợ gì thêm không?',
      },
      {
        fromUserId: users.normalUser.id,
        toUserId: users.adminUser.id,
        content:
          'Cảm ơn bạn! Tôi muốn hỏi về chính sách đổi trả nếu có lỗi từ nhà sản xuất.',
      },
      {
        fromUserId: users.managerUser.id,
        toUserId: users.adminUser.id,
        content:
          'Xin chào Admin, cần cập nhật stock cho các sản phẩm giày mới.',
      },
      {
        fromUserId: users.adminUser.id,
        toUserId: users.managerUser.id,
        content:
          'Được rồi, tôi sẽ cập nhật ngay. Bạn có danh sách chi tiết không?',
      },
    ],
  });
}
