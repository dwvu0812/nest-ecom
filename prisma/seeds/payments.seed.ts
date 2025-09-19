import { PrismaClient } from '../../generated/prisma';

export async function seedPayments(prisma: PrismaClient): Promise<void> {
  await prisma.paymentTransaction.createMany({
    data: [
      {
        gateway: 'VNPay',
        accountNumber: '1234567890',
        amountIn: 25000000,
        code: 'VNPAY001',
        transactionContent: 'Thanh toán đơn hàng iPhone 15 - Đơn hàng #001',
        referenceNumber: 'REF001',
        body: JSON.stringify({
          orderId: 1,
          productName: 'iPhone 15',
          quantity: 1,
        }),
      },
      {
        gateway: 'MoMo',
        accountNumber: '0987654321',
        amountIn: 3500000,
        code: 'MOMO001',
        transactionContent: 'Thanh toán đơn hàng Nike Air Max - Đơn hàng #002',
        referenceNumber: 'REF002',
        body: JSON.stringify({
          orderId: 2,
          productName: 'Nike Air Max',
          quantity: 1,
        }),
      },
      {
        gateway: 'ZaloPay',
        accountNumber: '1122334455',
        amountIn: 22000000,
        code: 'ZALO001',
        transactionContent: 'Thanh toán đơn hàng Galaxy S24 - Đơn hàng #003',
        referenceNumber: 'REF003',
        body: JSON.stringify({
          orderId: 3,
          productName: 'Galaxy S24',
          quantity: 1,
        }),
      },
      {
        gateway: 'VNPay',
        accountNumber: '5566778899',
        amountIn: 45000000,
        code: 'VNPAY002',
        transactionContent: 'Thanh toán đơn hàng MacBook Pro - Đơn hàng #004',
        referenceNumber: 'REF004',
        body: JSON.stringify({
          orderId: 4,
          productName: 'MacBook Pro 14"',
          quantity: 1,
        }),
      },
      {
        gateway: 'Banking',
        accountNumber: '9988776655',
        amountIn: 4500000,
        code: 'BANK001',
        transactionContent: 'Chuyển khoản thanh toán Adidas Ultraboost',
        referenceNumber: 'REF005',
        body: JSON.stringify({
          orderId: 5,
          productName: 'Adidas Ultraboost',
          quantity: 1,
        }),
      },
    ],
  });
}
