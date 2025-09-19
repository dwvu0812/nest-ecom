import { PrismaClient } from '../../generated/prisma';
import { seedLanguages } from './languages.seed';
import { seedPermissions } from './permissions.seed';
import { seedRoles } from './roles.seed';
import { seedUsers } from './users.seed';
import { seedBrands } from './brands.seed';
import { seedCategories } from './categories.seed';
import { seedProducts } from './products.seed';
import { seedOrders } from './orders.seed';
import { seedReviews } from './reviews.seed';
import { seedMessages } from './messages.seed';
import { seedPayments } from './payments.seed';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️ Đang xóa dữ liệu cũ...');

  // Xóa theo thứ tự quan hệ với try-catch để bỏ qua bảng không tồn tại
  const tables = [
    'message',
    'paymentTransaction',
    'review',
    'productSKUSnapshot',
    'order',
    'cartItem',
    'sKU',
    'variantOption',
    'variant',
    'productTranslation',
    'product',
    'categoryTranslation',
    'category',
    'brandTranslation',
    'brand',
    'userTranslation',
    'refreshToken',
    'verificationCode',
    'user',
    'role',
    'permission',
    'language',
  ];

  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany();
      console.log(`✅ Đã xóa dữ liệu từ bảng: ${table}`);
    } catch (error: any) {
      if (error.code === 'P2021') {
        console.log(`⚠️  Bảng ${table} không tồn tại, bỏ qua...`);
      } else {
        console.error(
          `❌ Lỗi khi xóa dữ liệu từ bảng ${table}:`,
          error.message,
        );
        throw error;
      }
    }
  }

  console.log('✅ Hoàn tất xóa dữ liệu cũ');
}

async function main() {
  try {
    await clearDatabase();

    // Seed theo thứ tự phụ thuộc
    const languages = await seedLanguages(prisma);
    console.log('✅ Languages seeded');

    const permissions = await seedPermissions(prisma);
    console.log('✅ Permissions seeded');

    const roles = await seedRoles(prisma, permissions);
    console.log('✅ Roles seeded');

    const users = await seedUsers(prisma, roles);
    console.log('✅ Users seeded');

    const brands = await seedBrands(prisma, users);
    console.log('✅ Brands seeded');

    const categories = await seedCategories(prisma, users, languages);
    console.log('✅ Categories seeded');

    const products = await seedProducts(
      prisma,
      users,
      languages,
      brands,
      categories,
    );
    console.log('✅ Products seeded');

    await seedOrders(prisma, users);
    console.log('✅ Orders seeded');

    await seedReviews(prisma, users, products);
    console.log('✅ Reviews seeded');

    await seedMessages(prisma, users);
    console.log('✅ Messages seeded');

    await seedPayments(prisma);
    console.log('✅ Payments seeded');

    console.log(`
🎉 Seed data đã được tạo thành công!

🔐 Thông tin đăng nhập:
Admin: admin@example.com / 123456
Manager: manager@example.com / 123456  
User: user@example.com / 123456
    `);
  } catch (error) {
    console.error('❌ Lỗi khi chạy seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
