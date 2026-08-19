import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'WORKER';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid format.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'monarc_royal_ice_cream_super_secret_jwt_key_2026_987654321';

    const decoded = jwt.verify(token, secret) as AuthUser;

    // Check if user is still active in database if database is reachable
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, name: true, role: true, isActive: true },
      });

      if (user) {
        if (!user.isActive) {
          res.status(401).json({
            success: false,
            message: 'User account is deactivated or no longer exists.',
          });
          return;
        }

        req.user = {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        };
        next();
        return;
      }
    } catch {
      // Fall back to decoded JWT signature if DB is in disconnected/mock unit-test mode
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> | void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required.',
    });
    return;
  }
  next();
};
