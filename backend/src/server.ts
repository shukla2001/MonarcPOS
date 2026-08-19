import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ PostgreSQL / Prisma Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Monarc Ice Creams POS & Admin API running on http://localhost:${PORT}`);
      console.log(`🍦 Target Production Host: admin.monarcicecreams.com`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
