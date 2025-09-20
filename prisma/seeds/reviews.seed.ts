/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient, User } from '@prisma/client';

export async function seedReviews(
  prisma: PrismaClient,
  users: { adminUser: User; managerUser: User; normalUser: User },
  products: any,
): Promise<void> {
  await prisma.review.createMany({
    data: [
      {
        content:
          'Sản phẩm tuyệt vời, rất hài lòng! Camera rất sắc nét và pin trâu.',
        rating: 5,
        productId: products.iphone15.id,
        userId: users.normalUser.id,
      },
      {
        content: 'Chất lượng tốt, giao hàng nhanh. Sẽ mua thêm lần sau.',
        rating: 4,
        productId: products.iphone15.id,
        userId: users.managerUser.id,
      },
      {
        content: 'Galaxy S24 màn hình đẹp, hiệu năng mượt. Đáng tiền!',
        rating: 5,
        productId: products.galaxyS24.id,
        userId: users.normalUser.id,
      },
      {
        content:
          'MacBook Pro rất mạnh mẽ cho công việc thiết kế. Chip M3 Pro tuyệt vời!',
        rating: 5,
        productId: products.macbookPro.id,
        userId: users.managerUser.id,
      },
      {
        content: 'Giày rất thoải mái, đúng size. Phù hợp để chạy bộ hàng ngày.',
        rating: 5,
        productId: products.airMax.id,
        userId: users.normalUser.id,
      },
      {
        content:
          'Ultraboost êm chân, thiết kế đẹp. Giá hơi cao nhưng xứng đáng.',
        rating: 4,
        productId: products.ultraboost.id,
        userId: users.normalUser.id,
      },
    ],
  });
}
