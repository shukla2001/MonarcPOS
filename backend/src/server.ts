import app from './app';
import prisma from './config/db';

const PORT = process.env.PORT || 5000;

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const connectToDatabase = async () => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      await prisma.$connect();
      console.log('✅ PostgreSQL / Prisma Database connected successfully.');
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt}/5 failed:`, error);

      if (attempt === 5) return;

      await wait(attempt * 2000);
    }
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Monarc Ice Creams POS & Admin API running on http://localhost:${PORT}`);
  console.log(`🍦 Target Production Host: admin.monarcicecreams.com`);
  void connectToDatabase();
});

