import prisma from '../../utils/prisma';
import { parsePagination, createPaginatedResponse } from '../../utils/pagination';
import { CreateCustomerInput, UpdateCustomerInput } from './customer.schema';
import { Prisma } from '@prisma/client';

export class CustomerService {
  async list(query: any) {
    const pagination = parsePagination(query.page, query.limit);

    const where: Prisma.CustomerWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { businessName: { contains: query.search } },
        { mobile: { contains: query.search } },
        { email: { contains: query.search } },
        { gstNumber: { contains: query.search } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.customerType) {
      where.customerType = query.customerType;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { customerNotes: true, challans: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return createPaginatedResponse(customers, total, pagination);
  }

  async getById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        customerNotes: {
          include: {
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw { status: 404, message: 'Customer not found' };
    }

    return customer;
  }

  async create(input: CreateCustomerInput, userId: string) {
    return prisma.customer.create({
      data: {
        ...input,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, input: UpdateCustomerInput) {
    const exists = await prisma.customer.findUnique({ where: { id } });
    if (!exists) {
      throw { status: 404, message: 'Customer not found' };
    }

    return prisma.customer.update({
      where: { id },
      data: {
        ...input,
        followUpDate: input.followUpDate ? new Date(input.followUpDate) : input.followUpDate === null ? null : undefined,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async addNote(customerId: string, note: string, userId: string) {
    const exists = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!exists) {
      throw { status: 404, message: 'Customer not found' };
    }

    return prisma.customerNote.create({
      data: {
        customerId,
        note,
        createdById: userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async getFollowUps(query: any) {
    const pagination = parsePagination(query.page, query.limit);

    const where: Prisma.CustomerWhereInput = {
      followUpDate: { not: null },
      status: { not: 'INACTIVE' },
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { followUpDate: 'asc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return createPaginatedResponse(customers, total, pagination);
  }
}
