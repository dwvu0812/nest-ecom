/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Brand, Language, PrismaClient, Product, User } from '@prisma/client';

interface ProductData {
  iphone15: Product;
  galaxyS24: Product;
  macbookPro: Product;
  airMax: Product;
  ultraboost: Product;
}

export async function seedProducts(
  prisma: PrismaClient,
  users: { adminUser: User; managerUser: User; normalUser: User },
  languages: { vietnamese: Language; english: Language },
  brands: {
    appleBrand: Brand;
    samsungBrand: Brand;
    nikeBrand: Brand;
    adidaBrand: Brand;
  },
  categories: any,
): Promise<ProductData> {
  // Tạo Products
  const iphone15 = await prisma.product.create({
    data: {
      base_price: 25000000,
      virtual_price: 28000000,
      brandId: brands.appleBrand.id,
      images: [
        'https://via.placeholder.com/400x400?text=iPhone15-1',
        'https://via.placeholder.com/400x400?text=iPhone15-2',
        'https://via.placeholder.com/400x400?text=iPhone15-3',
      ],
      createdById: users.adminUser.id,
      categories: {
        connect: [{ id: categories.phoneCategory.id }],
      },
    },
  });

  const galaxyS24 = await prisma.product.create({
    data: {
      base_price: 22000000,
      virtual_price: 24000000,
      brandId: brands.samsungBrand.id,
      images: [
        'https://via.placeholder.com/400x400?text=GalaxyS24-1',
        'https://via.placeholder.com/400x400?text=GalaxyS24-2',
      ],
      createdById: users.adminUser.id,
      categories: {
        connect: [{ id: categories.phoneCategory.id }],
      },
    },
  });

  const macbookPro = await prisma.product.create({
    data: {
      base_price: 45000000,
      virtual_price: 50000000,
      brandId: brands.appleBrand.id,
      images: [
        'https://via.placeholder.com/400x400?text=MacBookPro-1',
        'https://via.placeholder.com/400x400?text=MacBookPro-2',
      ],
      createdById: users.adminUser.id,
      categories: {
        connect: [{ id: categories.laptopCategory.id }],
      },
    },
  });

  const airMax = await prisma.product.create({
    data: {
      base_price: 3500000,
      virtual_price: 4000000,
      brandId: brands.nikeBrand.id,
      images: [
        'https://via.placeholder.com/400x400?text=AirMax-1',
        'https://via.placeholder.com/400x400?text=AirMax-2',
      ],
      createdById: users.adminUser.id,
      categories: {
        connect: [{ id: categories.shoeCategory.id }],
      },
    },
  });

  const ultraboost = await prisma.product.create({
    data: {
      base_price: 4500000,
      virtual_price: 5000000,
      brandId: brands.adidaBrand.id,
      images: [
        'https://via.placeholder.com/400x400?text=Ultraboost-1',
        'https://via.placeholder.com/400x400?text=Ultraboost-2',
      ],
      createdById: users.adminUser.id,
      categories: {
        connect: [{ id: categories.shoeCategory.id }],
      },
    },
  });

  // Tạo Product Translations
  const productTranslations = [
    // iPhone 15
    {
      productId: iphone15.id,
      languageId: languages.vietnamese.id,
      name: 'iPhone 15',
      description:
        'iPhone 15 mới nhất với chip A17 Pro, camera 48MP và nhiều tính năng vượt trội',
    },
    {
      productId: iphone15.id,
      languageId: languages.english.id,
      name: 'iPhone 15',
      description:
        'Latest iPhone 15 with A17 Pro chip, 48MP camera and many outstanding features',
    },
    // Galaxy S24
    {
      productId: galaxyS24.id,
      languageId: languages.vietnamese.id,
      name: 'Galaxy S24',
      description: 'Samsung Galaxy S24 với AI tiên tiến và camera zoom 200MP',
    },
    {
      productId: galaxyS24.id,
      languageId: languages.english.id,
      name: 'Galaxy S24',
      description: 'Samsung Galaxy S24 with advanced AI and 200MP zoom camera',
    },
    // MacBook Pro
    {
      productId: macbookPro.id,
      languageId: languages.vietnamese.id,
      name: 'MacBook Pro 14"',
      description:
        'MacBook Pro 14 inch với chip M3 Pro, hiệu năng mạnh mẽ cho chuyên gia',
    },
    {
      productId: macbookPro.id,
      languageId: languages.english.id,
      name: 'MacBook Pro 14"',
      description:
        'MacBook Pro 14-inch with M3 Pro chip, powerful performance for professionals',
    },
    // Air Max
    {
      productId: airMax.id,
      languageId: languages.vietnamese.id,
      name: 'Nike Air Max',
      description: 'Giày thể thao Nike Air Max với công nghệ đệm khí tuyệt vời',
    },
    {
      productId: airMax.id,
      languageId: languages.english.id,
      name: 'Nike Air Max',
      description:
        'Nike Air Max sports shoes with excellent air cushioning technology',
    },
    // Ultraboost
    {
      productId: ultraboost.id,
      languageId: languages.vietnamese.id,
      name: 'Adidas Ultraboost',
      description: 'Giày chạy Adidas Ultraboost với công nghệ Boost đệm êm',
    },
    {
      productId: ultraboost.id,
      languageId: languages.english.id,
      name: 'Adidas Ultraboost',
      description:
        'Adidas Ultraboost running shoes with soft Boost cushioning technology',
    },
  ];

  await prisma.productTranslation.createMany({
    data: productTranslations,
  });

  // Tạo Variants và SKUs
  await createVariantsAndSKUs(
    prisma,
    { iphone15, galaxyS24, macbookPro, airMax, ultraboost },
    users.adminUser,
  );

  return { iphone15, galaxyS24, macbookPro, airMax, ultraboost };
}

async function createVariantsAndSKUs(
  prisma: PrismaClient,
  products: ProductData,
  adminUser: User,
) {
  // Variants cho iPhone 15
  const colorVariant = await prisma.variant.create({
    data: {
      name: 'Màu sắc',
      productId: products.iphone15.id,
      createdById: adminUser.id,
    },
  });

  const storageVariant = await prisma.variant.create({
    data: {
      name: 'Dung lượng',
      productId: products.iphone15.id,
      createdById: adminUser.id,
    },
  });

  // Variant Options cho iPhone 15
  const blackOption = await prisma.variantOption.create({
    data: {
      value: 'Đen',
      variantId: colorVariant.id,
      createdById: adminUser.id,
    },
  });

  const whiteOption = await prisma.variantOption.create({
    data: {
      value: 'Trắng',
      variantId: colorVariant.id,
      createdById: adminUser.id,
    },
  });

  const storage128 = await prisma.variantOption.create({
    data: {
      value: '128GB',
      variantId: storageVariant.id,
      createdById: adminUser.id,
    },
  });

  const storage256 = await prisma.variantOption.create({
    data: {
      value: '256GB',
      variantId: storageVariant.id,
      createdById: adminUser.id,
    },
  });

  // SKUs cho iPhone 15
  await prisma.sKU.create({
    data: {
      value: 'iPhone 15 Đen 128GB',
      price: 25000000,
      stock: 50,
      images: ['https://via.placeholder.com/400x400?text=iPhone15-Black-128GB'],
      productId: products.iphone15.id,
      createdById: adminUser.id,
      variantOptions: {
        connect: [{ id: blackOption.id }, { id: storage128.id }],
      },
    },
  });

  await prisma.sKU.create({
    data: {
      value: 'iPhone 15 Trắng 256GB',
      price: 28000000,
      stock: 30,
      images: ['https://via.placeholder.com/400x400?text=iPhone15-White-256GB'],
      productId: products.iphone15.id,
      createdById: adminUser.id,
      variantOptions: {
        connect: [{ id: whiteOption.id }, { id: storage256.id }],
      },
    },
  });

  // Variants cho giày (Size)
  const sizeVariantAirMax = await prisma.variant.create({
    data: {
      name: 'Kích thước',
      productId: products.airMax.id,
      createdById: adminUser.id,
    },
  });

  const sizeVariantUltraboost = await prisma.variant.create({
    data: {
      name: 'Kích thước',
      productId: products.ultraboost.id,
      createdById: adminUser.id,
    },
  });

  // Size options
  const sizes = ['40', '41', '42', '43', '44'];

  for (const size of sizes) {
    // Air Max sizes
    const airMaxSizeOption = await prisma.variantOption.create({
      data: {
        value: size,
        variantId: sizeVariantAirMax.id,
        createdById: adminUser.id,
      },
    });

    await prisma.sKU.create({
      data: {
        value: `Nike Air Max Size ${size}`,
        price: 3500000,
        stock: 25,
        images: [`https://via.placeholder.com/400x400?text=AirMax-${size}`],
        productId: products.airMax.id,
        createdById: adminUser.id,
        variantOptions: {
          connect: [{ id: airMaxSizeOption.id }],
        },
      },
    });

    // Ultraboost sizes
    const ultraboostSizeOption = await prisma.variantOption.create({
      data: {
        value: size,
        variantId: sizeVariantUltraboost.id,
        createdById: adminUser.id,
      },
    });

    await prisma.sKU.create({
      data: {
        value: `Adidas Ultraboost Size ${size}`,
        price: 4500000,
        stock: 20,
        images: [`https://via.placeholder.com/400x400?text=Ultraboost-${size}`],
        productId: products.ultraboost.id,
        createdById: adminUser.id,
        variantOptions: {
          connect: [{ id: ultraboostSizeOption.id }],
        },
      },
    });
  }
}
