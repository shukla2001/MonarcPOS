import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Express = express();

// Middleware
app.use(
  cors({
    origin: '*', // Allow kiosk frontend and web admin clients
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Root Routes
app.use('/api', apiRouter);

// Serve Frontend Static Files (Single-Host Deployment support for Hostinger / VPS)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
const localPublicPath = path.join(__dirname, '../public');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else if (fs.existsSync(localPublicPath)) {
  app.use(express.static(localPublicPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(localPublicPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

export default app;
