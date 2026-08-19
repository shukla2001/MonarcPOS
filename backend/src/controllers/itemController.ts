import { Request, Response } from 'express';
import prisma from '../config/db';
import { Prisma } from '@prisma/client';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message,
    });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `Category "${name}" already exists.`,
      });
      return;
    }

    const category = await prisma.category.create({
      data: { name: name.trim() },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, search, lowStock } = req.query;

    const whereClause: Prisma.ItemWhereInput = {};

    if (categoryId && !isNaN(Number(categoryId))) {
      whereClause.categoryId = Number(categoryId);
    }

    if (search && typeof search === 'string') {
      whereClause.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (lowStock === 'true') {
      whereClause.stock = {
        lte: 10,
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory items',
      error: error.message,
    });
  }
};

export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid item ID' });
      return;
    }

    const item = await prisma.item.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    res.status(200).json({ success: true, item });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve item',
      error: error.message,
    });
  }
};

export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, categoryId, price, unit, stock } = req.body;

    const categoryExists = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!categoryExists) {
      res.status(404).json({
        success: false,
        message: `Category with ID ${categoryId} does not exist.`,
      });
      return;
    }

    const item = await prisma.item.create({
      data: {
        name: name.trim(),
        categoryId: Number(categoryId),
        price: new Prisma.Decimal(price),
        unit: unit.trim().toLowerCase(),
        stock: stock !== undefined ? Number(stock) : 0,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create item',
      error: error.message,
    });
  }
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid item ID' });
      return;
    }

    const { name, categoryId, price, unit, stock } = req.body;

    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      if (!cat) {
        res.status(404).json({ success: false, message: 'Specified category does not exist' });
        return;
      }
    }

    const updateData: Prisma.ItemUpdateInput = {};
    if (name) updateData.name = name.trim();
    if (categoryId) updateData.category = { connect: { id: Number(categoryId) } };
    if (price !== undefined) updateData.price = new Prisma.Decimal(price);
    if (unit) updateData.unit = unit.trim().toLowerCase();
    if (stock !== undefined) updateData.stock = Number(stock);

    const updated = await prisma.item.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update item',
      error: error.message,
    });
  }
};

export const restockItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    if (isNaN(id) || !quantity || quantity <= 0) {
      res.status(400).json({ success: false, message: 'Valid item ID and positive quantity required' });
      return;
    }

    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    const updated = await prisma.item.update({
      where: { id },
      data: {
        stock: {
          increment: Number(quantity),
        },
      },
      include: { category: true },
    });

    res.status(200).json({
      success: true,
      message: `Successfully restocked ${quantity} units of ${updated.name}.`,
      item: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to restock item',
      error: error.message,
    });
  }
};

export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid item ID' });
      return;
    }

    const existing = await prisma.item.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    if (existing._count.orderItems > 0) {
      res.status(400).json({
        success: false,
        message: `Cannot delete "${existing.name}" because it is referenced in past orders. You can set its stock to 0 instead.`,
      });
      return;
    }

    await prisma.item.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: `Item "${existing.name}" deleted successfully.`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete item',
      error: error.message,
    });
  }
};
