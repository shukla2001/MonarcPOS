import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 5000;

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const startServer = async () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL / Prisma Database connected successfully.');
      break;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/5 failed:`, error);

      if (attempt === 5) {
        process.exit(1);
      }

      await wait(attempt * 2000);
    }
  }

  try {
    app.listen(PORT, () => {
      console.log(`🚀 Monarc Ice Creams POS & Admin API running on http://localhost:${PORT}`);
      console.log(`🍦 Target Production Host: admin.monarcicecreams.com`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
