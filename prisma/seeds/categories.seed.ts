import { PrismaClient, Category, User, Language } from '@prisma/client';

export async function seedCategories(
  prisma: PrismaClient,
  users: { adminUser: User; managerUser: User; normalUser: User },
  languages: { vietnamese: Language; english: Language },
): Promise<{
  electronicCategory: Category;
  phoneCategory: Category;
  laptopCategory: Category;
  fashionCategory: Category;
  shoeCategory: Category;
  clothingCategory: Category;
}> {
  // Tạo main categories
  const electronicCategory = await prisma.category.create({
    data: {
      createdById: users.adminUser.id,
    },
  });

  const fashionCategory = await prisma.category.create({
    data: {
      createdById: users.adminUser.id,
    },
  });

  // Tạo sub categories
  const phoneCategory = await prisma.category.create({
    data: {
      parentCategoryId: electronicCategory.id,
      createdById: users.adminUser.id,
    },
  });

  const laptopCategory = await prisma.category.create({
    data: {
      parentCategoryId: electronicCategory.id,
      createdById: users.adminUser.id,
    },
  });

  const shoeCategory = await prisma.category.create({
    data: {
      parentCategoryId: fashionCategory.id,
      createdById: users.adminUser.id,
    },
  });

  const clothingCategory = await prisma.category.create({
    data: {
      parentCategoryId: fashionCategory.id,
      createdById: users.adminUser.id,
    },
  });

  // Tạo Category Translations
  const categoryTranslations = [
    // Electronics
    {
      categoryId: electronicCategory.id,
      languageId: languages.vietnamese.id,
      name: 'Điện tử',
      description: 'Các sản phẩm điện tử công nghệ',
    },
    {
      categoryId: electronicCategory.id,
      languageId: languages.english.id,
      name: 'Electronics',
      description: 'Electronic technology products',
    },
    // Phones
    {
      categoryId: phoneCategory.id,
      languageId: languages.vietnamese.id,
      name: 'Điện thoại',
      description: 'Điện thoại thông minh và phụ kiện',
    },
    {
      categoryId: phoneCategory.id,
      languageId: languages.english.id,
      name: 'Phones',
      description: 'Smartphones and accessories',
    },
    // Laptops
    {
      categoryId: laptopCategory.id,
      languageId: languages.vietnamese.id,
      name: 'Laptop',
      description: 'Máy tính xách tay và phụ kiện',
    },
    {
      categoryId: laptopCategory.id,
      languageId: languages.english.id,
      name: 'Laptops',
      description: 'Laptops and accessories',
    },
    // Fashion
    {
      categoryId: fashionCategory.id,
      languageId: languages.vietnamese.id,
      name: 'Thời trang',
      description: 'Quần áo và phụ kiện thời trang',
    },
    {
      categoryId: fashionCategory.id,
      languageId: languages.english.id,
      name: 'Fashion',
      description: 'Clothing and fashion accessories',
    },
    // Shoes
    {
      categoryId: shoeCategory.id,
      languageId: languages.vietnamese.id,
      name: 'Giày dép',
      description: 'Giày thể thao và formal',
    },
    {
      categoryId: shoeCategory.id,
      languageId: languages.english.id,
      name: 'Shoes',
      description: 'Sports and formal shoes',
    },
    // Clothing
    {
      categoryId: clothingCategory.id,
      languageId: languages.vietnamese.id,
      name: 'Quần áo',
      description: 'Quần áo nam nữ các loại',
    },
    {
      categoryId: clothingCategory.id,
      languageId: languages.english.id,
      name: 'Clothing',
      description: 'Men and women clothing',
    },
  ];

  await prisma.categoryTranslation.createMany({
    data: categoryTranslations,
  });

  return {
    electronicCategory,
    phoneCategory,
    laptopCategory,
    fashionCategory,
    shoeCategory,
    clothingCategory,
  };
}
