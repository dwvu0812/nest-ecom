import { PrismaClient, Brand, User } from '../../generated/prisma';

export async function seedBrands(
  prisma: PrismaClient,
  users: { adminUser: User; managerUser: User; normalUser: User },
): Promise<{
  appleBrand: Brand;
  samsungBrand: Brand;
  nikeBrand: Brand;
  adidaBrand: Brand;
}> {
  const appleBrand = await prisma.brand.create({
    data: {
      logo: 'https://via.placeholder.com/100x100?text=Apple',
      createdById: users.adminUser.id,
    },
  });

  const samsungBrand = await prisma.brand.create({
    data: {
      logo: 'https://via.placeholder.com/100x100?text=Samsung',
      createdById: users.adminUser.id,
    },
  });

  const nikeBrand = await prisma.brand.create({
    data: {
      logo: 'https://via.placeholder.com/100x100?text=Nike',
      createdById: users.adminUser.id,
    },
  });

  const adidaBrand = await prisma.brand.create({
    data: {
      logo: 'https://via.placeholder.com/100x100?text=Adidas',
      createdById: users.adminUser.id,
    },
  });

  // Tạo Brand Translations
  const languages = await prisma.language.findMany();
  const vietnamese = languages.find((l) => l.code === 'vi');
  const english = languages.find((l) => l.code === 'en');

  const brandTranslations = [
    // Apple
    {
      brandId: appleBrand.id,
      languageId: vietnamese?.id || 1,
      name: 'Apple',
      description: 'Công ty công nghệ hàng đầu thế giới',
    },
    {
      brandId: appleBrand.id,
      languageId: english?.id || 2,
      name: 'Apple',
      description: 'Leading technology company worldwide',
    },
    // Samsung
    {
      brandId: samsungBrand.id,
      languageId: vietnamese?.id || 1,
      name: 'Samsung',
      description: 'Tập đoàn điện tử Hàn Quốc',
    },
    {
      brandId: samsungBrand.id,
      languageId: english?.id || 2,
      name: 'Samsung',
      description: 'South Korean electronics conglomerate',
    },
    // Nike
    {
      brandId: nikeBrand.id,
      languageId: vietnamese?.id || 1,
      name: 'Nike',
      description: 'Thương hiệu thể thao nổi tiếng',
    },
    {
      brandId: nikeBrand.id,
      languageId: english?.id || 2,
      name: 'Nike',
      description: 'Famous sports brand',
    },
    // Adidas
    {
      brandId: adidaBrand.id,
      languageId: vietnamese?.id || 1,
      name: 'Adidas',
      description: 'Thương hiệu thể thao Đức',
    },
    {
      brandId: adidaBrand.id,
      languageId: english?.id || 2,
      name: 'Adidas',
      description: 'German sports brand',
    },
  ];

  await prisma.brandTranslation.createMany({
    data: brandTranslations,
  });

  return { appleBrand, samsungBrand, nikeBrand, adidaBrand };
}
