import prisma from '../../utils/prisma';
import { hashPassword } from '../../utils/password';
import { parsePagination, createPaginatedResponse } from '../../utils/pagination';
import { CreateUserInput, UpdateUserInput } from './user.schema';
import { Prisma } from '@prisma/client';

export class UserService {
  async list(query: any) {
    const pagination = parsePagination(query.page, query.limit);

    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return createPaginatedResponse(users, total, pagination);
  }

  async create(input: CreateUserInput) {
    const passwordHash = await hashPassword(input.password);

    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, input: UpdateUserInput) {
    const data: Prisma.UserUpdateInput = {
      name: input.name,
      email: input.email ? input.email.toLowerCase() : undefined,
      role: input.role,
      isActive: input.isActive,
    };

    if (input.password) {
      data.passwordHash = await hashPassword(input.password);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }
}
