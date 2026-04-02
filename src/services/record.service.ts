import { prisma } from '../prisma/client';
import { ApiError } from '../utils/apiError';
import { ROLES, Role } from '../utils/constants';

interface CreateRecordInput {
  amount: number;
  type: string;
  category: string;
  description?: string;
  transactionDate: string;
  userId: string;
}

interface UpdateRecordInput {
  amount?: number;
  type?: string;
  category?: string;
  description?: string;
  transactionDate?: string;
}

interface RecordQuery {
  page: string;
  limit: string;
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sortBy: string;
  sortOrder: string;
}

export class FinancialRecordService {
  static async create(input: CreateRecordInput) {
    return prisma.financialRecord.create({
      data: {
        amount: input.amount,
        type: input.type,
        category: input.category,
        description: input.description,
        transactionDate: new Date(input.transactionDate),
        userId: input.userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  static async getAll(
    query: RecordQuery,
    userId: string,
    userRole: Role
  ) {
    const page = Math.max(1, parseInt(query.page));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit)));
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (userRole === ROLES.VIEWER) {
      where.userId = userId;
    }

    if (query.type) {
      where.type = query.type;
    }


    if (query.category) {
      where.category = { contains: query.category };
    }

    if (query.startDate || query.endDate) {
      where.transactionDate = {};
      if (query.startDate) {
        where.transactionDate.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.transactionDate.lte = new Date(query.endDate);
      }
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip,
        take: limit,
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return { records, total, page, limit };
  }

  static async getById(recordId: string, userId: string, userRole: Role) {
    const record = await prisma.financialRecord.findFirst({
      where: {
        id: recordId,
        isDeleted: false,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

   
    if (userRole === ROLES.VIEWER && record.userId !== userId) {
      throw ApiError.forbidden('You can only view your own records');
    }

    return record;
  }

  static async update(
    recordId: string,
    input: UpdateRecordInput,
    userId: string,
    userRole: Role
  ) {
    const record = await prisma.financialRecord.findFirst({
      where: { id: recordId, isDeleted: false },
    });

    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    if (userRole !== ROLES.ADMIN && record.userId !== userId) {
      throw ApiError.forbidden('You can only update your own records');
    }

    const updateData: any = { ...input };
    if (input.transactionDate) {
      updateData.transactionDate = new Date(input.transactionDate);
    }

    return prisma.financialRecord.update({
      where: { id: recordId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }


  static async softDelete(recordId: string, userId: string, userRole: Role) {
    const record = await prisma.financialRecord.findFirst({
      where: { id: recordId, isDeleted: false },
    });

    if (!record) {
      throw ApiError.notFound('Financial record not found');
    }

    if (userRole !== ROLES.ADMIN && record.userId !== userId) {
      throw ApiError.forbidden('You can only delete your own records');
    }

    return prisma.financialRecord.update({
      where: { id: recordId },
      data: { isDeleted: true },
    });
  }
}
