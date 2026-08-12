import prisma from '../../utils/prisma';
import { parsePagination, createPaginatedResponse } from '../../utils/pagination';
import { CreateProductInput, UpdateProductInput } from './product.schema';
import { Prisma } from '@prisma/client';

export class ProductService {
  async list(query: any) {
    const pagination = parsePagination(query.page, query.limit);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { sku: { contains: query.search } },
      ];
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Filter low stock in app if requested
    let filteredProducts = products;
    if (query.lowStock === 'true') {
      filteredProducts = products.filter(p => p.currentStock <= p.minimumStock);
    }

    return createPaginatedResponse(filteredProducts, total, pagination);
  }

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        stockMovements: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      throw { status: 404, message: 'Product not found' };
    }

    return product;
  }

  async create(input: CreateProductInput) {
    return prisma.product.create({
      data: input,
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, input: UpdateProductInput) {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      throw { status: 404, message: 'Product not found' };
    }

    return prisma.product.update({
      where: { id },
      data: input,
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async getLowStock(query: any) {
    const pagination = parsePagination(query.page, query.limit);

    // Get all active products and filter by low stock
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { currentStock: 'asc' },
    });

    const lowStockProducts = allProducts.filter(p => p.currentStock <= p.minimumStock);
    const total = lowStockProducts.length;
    const paginatedProducts = lowStockProducts.slice(pagination.skip, pagination.skip + pagination.limit);

    return createPaginatedResponse(paginatedProducts, total, pagination);
  }
}
