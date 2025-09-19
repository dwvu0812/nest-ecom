import { PrismaClient, User } from '../../generated/prisma';

export async function seedOrders(
  prisma: PrismaClient,
  users: { adminUser: User; managerUser: User; normalUser: User },
): Promise<void> {
  // Lấy một số SKU để tạo đơn hàng
  const skus = await prisma.sKU.findMany({
    take: 3,
  });

  if (skus.length === 0) return;

  // Tạo Orders
  const order1 = await prisma.order.create({
    data: {
      userId: users.normalUser.id,
      status: 'DELIVERED',
      createdById: users.adminUser.id,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: users.normalUser.id,
      status: 'PENDING_DELIVERY',
      createdById: users.adminUser.id,
    },
  });

  // Tạo Product SKU Snapshots
  await prisma.productSKUSnapshot.create({
    data: {
      productName: 'iPhone 15',
      price: skus[0].price,
      images: skus[0].images,
      skuValue: skus[0].value,
      skuId: skus[0].id,
      orderId: order1.id,
      productId: skus[0].productId,
    },
  });

  if (skus[1]) {
    await prisma.productSKUSnapshot.create({
      data: {
        productName: 'Nike Air Max',
        price: skus[1].price,
        images: skus[1].images,
        skuValue: skus[1].value,
        skuId: skus[1].id,
        orderId: order2.id,
        productId: skus[1].productId,
      },
    });
  }

  // Tạo Cart Items
  await prisma.cartItem.createMany({
    data: [
      {
        quantity: 1,
        skuId: skus[0].id,
        userId: users.normalUser.id,
      },
      {
        quantity: 2,
        skuId: skus[1]?.id || skus[0].id,
        userId: users.normalUser.id,
      },
      {
        quantity: 1,
        skuId: skus[2]?.id || skus[0].id,
        userId: users.managerUser.id,
      },
    ],
  });
}
