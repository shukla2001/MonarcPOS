import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/db';
import { Role } from '@prisma/client';

export const getWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const workers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    });

    res.status(200).json({
      success: true,
      workers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve staff accounts',
      error: error.message,
    });
  }
};

export const createWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, role } = req.body;

    const existing = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: `Username "${username}" is already taken.`,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newWorker = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: (role as Role) || 'WORKER',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Account for ${newWorker.name} created successfully.`,
      worker: newWorker,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create worker account',
      error: error.message,
    });
  }
};

export const updateWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, isActive, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Worker account not found' });
      return;
    }

    const updateData: {
      name?: string;
      role?: Role;
      isActive?: boolean;
      password?: string;
    } = {};

    if (name) updateData.name = name.trim();
    if (role) updateData.role = role as Role;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedWorker = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Account for ${updatedWorker.name} updated successfully.`,
      worker: updatedWorker,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update worker account',
      error: error.message,
    });
  }
};

export const toggleWorkerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Worker not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Account ${updated.isActive ? 'activated' : 'deactivated'} successfully.`,
      worker: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle account status',
      error: error.message,
    });
  }
};
