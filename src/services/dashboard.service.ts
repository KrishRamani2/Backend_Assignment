
import { prisma } from '../prisma/client';
import { ROLES, Role } from '../utils/constants';

export class DashboardService {

  static async getSummary(userId: string, userRole: Role) {
    const ownershipFilter =
      userRole === ROLES.VIEWER ? { userId } : {};

    const baseWhere = {
      isDeleted: false,
      ...ownershipFilter,
    };


    const [
      totalIncome,
      totalExpense,
      categoryTotals,
      recentRecords,
      monthlyTrends,
      recordCount,
    ] = await Promise.all([

      prisma.financialRecord.aggregate({
        where: { ...baseWhere, type: 'INCOME' },
        _sum: { amount: true },
      }),

   
      prisma.financialRecord.aggregate({
        where: { ...baseWhere, type: 'EXPENSE' },
        _sum: { amount: true },
      }),

      prisma.financialRecord.groupBy({
        by: ['category', 'type'],
        where: baseWhere,
        _sum: { amount: true },
        _count: true,
        orderBy: { _sum: { amount: 'desc' } },
      }),

      
      prisma.financialRecord.findMany({
        where: baseWhere,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { transactionDate: 'desc' },
        take: 5,
      }),


      DashboardService.getMonthlyTrends(baseWhere),

    
      prisma.financialRecord.count({ where: baseWhere }),
    ]);

    const income = totalIncome._sum.amount || 0;
    const expense = totalExpense._sum.amount || 0;

    return {
      overview: {
        totalIncome: income,
        totalExpense: expense,
        netBalance: income - expense,
        totalRecords: recordCount,
      },
      categoryBreakdown: categoryTotals.map((ct) => ({
        category: ct.category,
        type: ct.type,
        total: ct._sum.amount || 0,
        count: ct._count,
      })),
      recentTransactions: recentRecords,
      monthlyTrends,
    };
  }

 
  private static async getMonthlyTrends(baseWhere: any) {
    
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const records = await prisma.financialRecord.findMany({
      where: {
        ...baseWhere,
        transactionDate: { gte: twelveMonthsAgo },
      },
      select: {
        amount: true,
        type: true,
        transactionDate: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

   
    const monthlyMap = new Map<
      string,
      { month: string; income: number; expense: number }
    >();

    for (const record of records) {
      const date = new Date(record.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, income: 0, expense: 0 });
      }

      const entry = monthlyMap.get(monthKey)!;
      if (record.type === 'INCOME') {
        entry.income += record.amount;
      } else {
        entry.expense += record.amount;
      }
    }

    
    return Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }
}
