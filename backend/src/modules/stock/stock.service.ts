import prisma from '../../utils/prisma';
import { parsePagination, createPaginatedResponse } from '../../utils/pagination';
import { StockMoveInput } from './stock.schema';
import { Prisma } from '@prisma/client';

export class StockService {
  async move(input: StockMoveInput, userId: string) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw { status: 404, message: 'Product not found' };
    }

    if (input.type === 'OUT') {
      if (product.currentStock < input.quantity) {
        throw {
          status: 400,
          message: `Insufficient stock. Available: ${product.currentStock}, Requested: ${input.quantity}`,
        };
      }
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: input.productId },
        data: {
          currentStock:
            input.type === 'IN'
              ? { increment: input.quantity }
              : { decrement: input.quantity },
        },
      });

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.type,
          quantity: input.quantity,
          reason: input.reason || (input.type === 'IN' ? 'Stock received' : 'Stock dispatched'),
          userId,
        },
        include: {
          product: { select: { id: true, name: true, sku: true, currentStock: true } },
          user: { select: { id: true, name: true } },
        },
      });

      return movement;
    });

    return result;
  }

  async listMovements(query: any) {
    const pagination = parsePagination(query.page, query.limit);

    const where: Prisma.StockMovementWhereInput = {};

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.type) {
      where.type = query.type;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return createPaginatedResponse(movements, total, pagination);
  }
}
