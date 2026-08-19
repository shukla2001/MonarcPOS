import { Request, Response } from 'express';
import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || 'monthly';
    const now = new Date();
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1; // 1-indexed (1-12)
    const specificDate = req.query.date ? new Date(req.query.date as string) : now;

    let startDate: Date;
    let endDate: Date;

    if (period === 'daily') {
      startDate = new Date(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate(), 0, 0, 0, 0);
      endDate = new Date(specificDate.getFullYear(), specificDate.getMonth(), specificDate.getDate(), 23, 59, 59, 999);
    } else if (period === 'yearly') {
      startDate = new Date(year, 0, 1, 0, 0, 0, 0);
      endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    } else {
      // monthly (default)
      startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(year, month, 0).getDate();
      endDate = new Date(year, month - 1, lastDay, 23, 59, 59, 999);
    }

    // Fetch all orders within the time range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        cashier: {
          select: { id: true, name: true, username: true },
        },
        items: {
          include: {
            item: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalRevenue = 0;
    let totalTax = 0;
    let totalSubtotal = 0;
    let totalItemsSold = 0;

    const paymentModes: Record<string, { count: number; total: number }> = {
      CASH: { count: 0, total: 0 },
      UPI: { count: 0, total: 0 },
      CARD: { count: 0, total: 0 },
    };

    const itemSalesMap = new Map<
      number,
      { id: number; name: string; category: string; quantity: number; revenue: number; unit: string }
    >();

    const cashierMap = new Map<
      string,
      { id: string; name: string; username: string; ordersCount: number; totalRevenue: number }
    >();

    // Time series buckets
    const timeSeriesMap = new Map<string, { label: string; revenue: number; orders: number }>();

    if (period === 'daily') {
      for (let h = 0; h < 24; h++) {
        const label = `${h.toString().padStart(2, '0')}:00`;
        timeSeriesMap.set(h.toString(), { label, revenue: 0, orders: 0 });
      }
    } else if (period === 'monthly') {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const label = `${month}/${d}`;
        timeSeriesMap.set(d.toString(), { label, revenue: 0, orders: 0 });
      }
    } else if (period === 'yearly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let m = 1; m <= 12; m++) {
        timeSeriesMap.set(m.toString(), { label: monthNames[m - 1], revenue: 0, orders: 0 });
      }
    }

    // Process orders
    for (const order of orders) {
      const orderTotal = Number(order.total);
      const orderTax = Number(order.tax);
      const orderSubtotal = Number(order.subtotal);

      totalRevenue += orderTotal;
      totalTax += orderTax;
      totalSubtotal += orderSubtotal;

      // Payment mode breakdown
      if (paymentModes[order.paymentMode]) {
        paymentModes[order.paymentMode].count += 1;
        paymentModes[order.paymentMode].total += orderTotal;
      }

      // Cashier breakdown
      const cId = order.cashierId;
      const existingCashier = cashierMap.get(cId) || {
        id: cId,
        name: order.cashier.name,
        username: order.cashier.username,
        ordersCount: 0,
        totalRevenue: 0,
      };
      existingCashier.ordersCount += 1;
      existingCashier.totalRevenue += orderTotal;
      cashierMap.set(cId, existingCashier);

      // Time series bucket filling
      const orderDate = new Date(order.createdAt);
      let bucketKey = '';
      if (period === 'daily') {
        bucketKey = orderDate.getHours().toString();
      } else if (period === 'monthly') {
        bucketKey = orderDate.getDate().toString();
      } else if (period === 'yearly') {
        bucketKey = (orderDate.getMonth() + 1).toString();
      }

      const bucket = timeSeriesMap.get(bucketKey);
      if (bucket) {
        bucket.revenue += orderTotal;
        bucket.orders += 1;
      }

      // Line items aggregation
      for (const lineItem of order.items) {
        totalItemsSold += lineItem.quantity;
        const lineRev = Number(lineItem.unitPrice) * lineItem.quantity;

        const existingItem = itemSalesMap.get(lineItem.itemId) || {
          id: lineItem.itemId,
          name: lineItem.item.name,
          category: lineItem.item.category?.name || 'Uncategorized',
          quantity: 0,
          revenue: 0,
          unit: lineItem.item.unit,
        };

        existingItem.quantity += lineItem.quantity;
        existingItem.revenue += lineRev;
        itemSalesMap.set(lineItem.itemId, existingItem);
      }
    }

    const topSellingItems = Array.from(itemSalesMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    const cashierPerformance = Array.from(cashierMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const chartData = Array.from(timeSeriesMap.values());

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    res.status(200).json({
      success: true,
      meta: {
        period,
        year,
        month,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        totalSubtotal: Number(totalSubtotal.toFixed(2)),
        totalOrders,
        totalItemsSold,
        averageOrderValue,
      },
      paymentModes,
      chartData,
      topSellingItems,
      cashierPerformance,
      recentOrders: orders.slice(0, 20),
    });
  } catch (error: any) {
    console.error('Sales report aggregation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message,
    });
  }
};
