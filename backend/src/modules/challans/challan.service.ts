import prisma from '../../utils/prisma';
import { parsePagination, createPaginatedResponse } from '../../utils/pagination';
import { CreateChallanInput, UpdateChallanInput } from './challan.schema';
import { Prisma } from '@prisma/client';

export class ChallanService {
  /**
   * Generates a unique daily sequential challan number.
   * Format: CHN-YYYYMMDD-XXXX
   */
  private async generateChallanNumber(): Promise<string> {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const prefix = `CHN-${todayStr}-`;

    // Find the last challan created today
    const lastChallan = await prisma.challan.findFirst({
      where: {
        challanNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        challanNumber: 'desc',
      },
    });

    let nextSeq = 1;
    if (lastChallan) {
      const parts = lastChallan.challanNumber.split('-');
      const seqStr = parts[parts.length - 1];
      const parsedSeq = parseInt(seqStr, 10);
      if (!isNaN(parsedSeq)) {
        nextSeq = parsedSeq + 1;
      }
    }

    const seqFormatted = String(nextSeq).padStart(4, '0');
    return `${prefix}${seqFormatted}`;
  }

  async list(query: any) {
    const pagination = parsePagination(query.page, query.limit);

    const where: Prisma.ChallanWhereInput = {};

    if (query.customerId) {
      where.customerId = query.customerId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { challanNumber: { contains: query.search } },
        { customer: { name: { contains: query.search } } },
        { customer: { businessName: { contains: query.search } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, businessName: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.challan.count({ where }),
    ]);

    return createPaginatedResponse(challans, total, pagination);
  }

  async getById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    if (!challan) {
      throw { status: 404, message: 'Challan not found' };
    }

    return challan;
  }

  async create(input: CreateChallanInput, userId: string) {
    const challanNumber = await this.generateChallanNumber();

    // Fetch product details for validation and snapshots
    const productIds = input.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      throw { status: 400, message: 'One or more selected products are invalid or inactive' };
    }

    // Build map for quick access
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate totals and compile items with snapshot details
    let totalAmount = 0;
    const challanItemsData = input.items.map((item) => {
      const product = productMap.get(item.productId)!;
      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;

      return {
        productId: item.productId,
        productName: product.name,
        productSku: product.sku,
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal,
      };
    });

    // Check stock if attempting to CONFIRM directly on creation
    if (input.status === 'CONFIRMED') {
      for (const item of input.items) {
        const product = productMap.get(item.productId)!;
        if (product.currentStock < item.quantity) {
          throw {
            status: 400,
            message: `Insufficient stock for product ${product.name} (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`,
          };
        }
      }
    }

    // Execute database operations in a transaction
    const challan = await prisma.$transaction(async (tx) => {
      // Create the main challan
      const newChallan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: input.customerId,
          createdById: userId,
          status: input.status,
          totalAmount,
          notes: input.notes,
          confirmedAt: input.status === 'CONFIRMED' ? new Date() : null,
          items: {
            create: challanItemsData,
          },
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, businessName: true } },
        },
      });

      // If confirmed, update inventory and stock movements
      if (input.status === 'CONFIRMED') {
        for (const item of challanItemsData) {
          // Decrement stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity },
            },
          });

          // Create stock movement out
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'OUT',
              quantity: item.quantity,
              reason: `Sales Challan Confirmation (${challanNumber})`,
              userId,
            },
          });
        }
      }

      return newChallan;
    });

    return challan;
  }

  async update(id: string, input: UpdateChallanInput, userId: string) {
    const existing = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      throw { status: 404, message: 'Challan not found' };
    }

    if (existing.status !== 'DRAFT') {
      throw { status: 400, message: 'Only draft challans can be modified' };
    }

    // Prepare update data
    const updateData: Prisma.ChallanUpdateInput = {
      notes: input.notes,
    };

    if (input.customerId) {
      updateData.customer = { connect: { id: input.customerId } };
    }

    if (input.items) {
      const productIds = input.items.map((i) => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
      });

      if (products.length !== productIds.length) {
        throw { status: 400, message: 'One or more selected products are invalid or inactive' };
      }

      const productMap = new Map(products.map((p) => [p.id, p]));
      let totalAmount = 0;

      const itemsToCreate = input.items.map((item) => {
        const product = productMap.get(item.productId)!;
        const lineTotal = product.price * item.quantity;
        totalAmount += lineTotal;

        return {
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          unitPrice: product.price,
          quantity: item.quantity,
          lineTotal,
        };
      });

      updateData.totalAmount = totalAmount;

      return prisma.$transaction(async (tx) => {
        // Clear existing items
        await tx.challanItem.deleteMany({
          where: { challanId: id },
        });

        // Update challan with new items
        return tx.challan.update({
          where: { id },
          data: {
            ...updateData,
            items: {
              create: itemsToCreate,
            },
          },
          include: {
            items: true,
            customer: { select: { id: true, name: true, businessName: true } },
          },
        });
      });
    }

    return prisma.challan.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: { select: { id: true, name: true, businessName: true } },
      },
    });
  }

  async confirm(id: string, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      throw { status: 404, message: 'Challan not found' };
    }

    if (challan.status !== 'DRAFT') {
      throw { status: 400, message: `Challan is already ${challan.status}` };
    }

    // Retrieve active items and current product stock levels
    const productIds = challan.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate sufficient stock for ALL items
    for (const item of challan.items) {
      const product = productMap.get(item.productId);
      if (!product || !product.isActive) {
        throw {
          status: 400,
          message: `Product ${item.productName} is inactive or no longer exists.`,
        };
      }

      if (product.currentStock < item.quantity) {
        throw {
          status: 400,
          message: `Insufficient stock for product ${product.name} (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`,
        };
      }
    }

    // Transactionally update stock levels, log movements and mark confirmed
    return prisma.$transaction(async (tx) => {
      for (const item of challan.items) {
        // Reduce stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        // Add movement log
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'OUT',
            quantity: item.quantity,
            reason: `Sales Challan Confirmation (${challan.challanNumber})`,
            userId,
          },
        });
      }

      // Mark confirmed
      return tx.challan.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, businessName: true } },
        },
      });
    });
  }

  async cancel(id: string, userId: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      throw { status: 404, message: 'Challan not found' };
    }

    if (challan.status === 'CANCELLED') {
      throw { status: 400, message: 'Challan is already cancelled' };
    }

    const wasConfirmed = challan.status === 'CONFIRMED';

    return prisma.$transaction(async (tx) => {
      // If previously confirmed, return stock to warehouse
      if (wasConfirmed) {
        for (const item of challan.items) {
          // Increment stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { increment: item.quantity },
            },
          });

          // Create stock movement in
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              type: 'IN',
              quantity: item.quantity,
              reason: `Sales Challan Cancelation Restock (${challan.challanNumber})`,
              userId,
            },
          });
        }
      }

      // Update status to CANCELLED
      return tx.challan.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
        include: {
          items: true,
          customer: { select: { id: true, name: true, businessName: true } },
        },
      });
    });
  }
}
