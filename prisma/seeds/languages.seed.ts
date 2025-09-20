import { PrismaClient, Language } from '@prisma/client';

export async function seedLanguages(prisma: PrismaClient): Promise<{
  vietnamese: Language;
  english: Language;
}> {
  const vietnamese = await prisma.language.create({
    data: {
      name: 'Tiếng Việt',
      code: 'vi',
    },
  });

  const english = await prisma.language.create({
    data: {
      name: 'English',
      code: 'en',
    },
  });

  return { vietnamese, english };
}
