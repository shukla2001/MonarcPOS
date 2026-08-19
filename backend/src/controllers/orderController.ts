import { Response } from 'express';
import prisma from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';

interface CartItemInput {
  itemId: number;
  quantity: number;
}

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const cashierId = req.user?.id;
    if (!cashierId) {
      res.status(401).json({ success: false, message: 'Cashier authentication required.' });
      return;
    }

    const { items, paymentMode } = req.body as {
      items: CartItemInput[];
      paymentMode: 'CASH' | 'UPI' | 'CARD';
    };

    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
      return;
    }

    // Execute atomic transaction to guard against concurrency and stock race conditions
    const orderResult = await prisma.$transaction(
      async (tx) => {
        // Fetch all requested items from DB to lock/verify fresh stock and prices
        const itemIds = items.map((i) => i.itemId);
        const dbItems = await tx.item.findMany({
          where: { id: { in: itemIds } },
          include: { category: true },
        });

        const dbItemMap = new Map(dbItems.map((item) => [item.id, item]));

        let subtotal = new Prisma.Decimal(0);
        const orderItemsData: {
          itemId: number;
          quantity: number;
          unitPrice: Prisma.Decimal;
        }[] = [];

        // Validate existence & stock for each item in the cart
        for (const cartItem of items) {
          const dbItem = dbItemMap.get(cartItem.itemId);

          if (!dbItem) {
            throw new Error(`Item with ID ${cartItem.itemId} not found in active catalog.`);
          }

          if (dbItem.stock < cartItem.quantity) {
            throw new Error(
              `Insufficient stock for "${dbItem.name}". Available: ${dbItem.stock}, Requested: ${cartItem.quantity}.`
            );
          }

          const linePrice = dbItem.price.mul(cartItem.quantity);
          subtotal = subtotal.add(linePrice);

          orderItemsData.push({
            itemId: dbItem.id,
            quantity: cartItem.quantity,
            unitPrice: dbItem.price,
          });

          // Atomically decrement stock level
          await tx.item.update({
            where: { id: dbItem.id },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });
        }

        // Calculate 5% GST tax and total
        // Standard 5% GST for Ice Cream Parlours & Cafes
        const taxRate = new Prisma.Decimal(0.05);
        const tax = subtotal.mul(taxRate);
        const total = subtotal.add(tax);

        // Generate unique order number (e.g., #ORD-849201)
        const orderTimestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.floor(100 + Math.random() * 900);
        const orderNumber = `#ORD-${orderTimestamp}${randomSuffix}`;

        // Create Order and nested OrderItems
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            cashierId,
            subtotal,
            tax,
            total,
            paymentMode,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            cashier: {
              select: { id: true, name: true, username: true, role: true },
            },
            items: {
              include: {
                item: {
                  include: { category: true },
                },
              },
            },
          },
        });

        return createdOrder;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Order created and stock updated successfully.',
      order: orderResult,
    });
  } catch (error: any) {
    console.error('Order creation transaction failed:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process order checkout.',
    });
  }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { limit = 20, page = 1, search, cashierId, startDate, endDate } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.OrderWhereInput = {};

    if (cashierId && typeof cashierId === 'string') {
      where.cashierId = cashierId;
    }

    if (search && typeof search === 'string') {
      where.orderNumber = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          cashier: {
            select: { id: true, name: true, username: true },
          },
          items: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.order.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / take),
      currentPage: Number(page),
      orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history',
      error: error.message,
    });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        cashier: {
          select: { id: true, name: true, username: true, role: true },
        },
        items: {
          include: {
            item: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message,
    });
  }
};
