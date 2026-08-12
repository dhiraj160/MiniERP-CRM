import prisma from '../../utils/prisma';

export class CategoryService {
  async list() {
    return prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string) {
    return prisma.category.create({
      data: { name },
    });
  }
}
