import { PrismaClient, Role, PaymentMode, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('👑 Seeding Monarc Ice Creams Database...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users (Admin & Workers)
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const workerPassword = await bcrypt.hash('Worker@123', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: adminPassword,
      name: 'Monarc Store Manager',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const cashier1 = await prisma.user.create({
    data: {
      username: 'cashier1',
      password: workerPassword,
      name: 'Rajesh Sharma',
      role: Role.WORKER,
      isActive: true,
    },
  });

  const cashier2 = await prisma.user.create({
    data: {
      username: 'cashier2',
      password: workerPassword,
      name: 'Ananya Iyer',
      role: Role.WORKER,
      isActive: true,
    },
  });

  console.log('👤 Users seeded: admin, cashier1, cashier2');

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Artisanal Scoops' },
    { name: 'Signature Royal Sundaes' },
    { name: 'Belgian Waffles & Crepes' },
    { name: 'Thick Shakes & Frosts' },
    { name: 'Pastries & Warm Desserts' },
    { name: 'Ice Cream Cakes & Tubs' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.name] = created;
  }

  console.log('🏷️ Categories seeded:', Object.keys(categories).length);

  // 3. Seed Menu Items
  const itemsData = [
    // Artisanal Scoops
    {
      name: 'Royal Belgian Dark Chocolate',
      categoryId: categories['Artisanal Scoops'].id,
      price: new Prisma.Decimal('120.00'),
      unit: 'scoop',
      stock: 60,
    },
    {
      name: 'Madagascar Golden Vanilla',
      categoryId: categories['Artisanal Scoops'].id,
      price: new Prisma.Decimal('100.00'),
      unit: 'scoop',
      stock: 75,
    },
    {
      name: 'Alfonso Mango Alphonso Bliss',
      categoryId: categories['Artisanal Scoops'].id,
      price: new Prisma.Decimal('130.00'),
      unit: 'scoop',
      stock: 45,
    },
    {
      name: 'Roasted Almond Butterscotch',
      categoryId: categories['Artisanal Scoops'].id,
      price: new Prisma.Decimal('140.00'),
      unit: 'scoop',
      stock: 50,
    },
    {
      name: 'Sicilian Pistachio Royale',
      categoryId: categories['Artisanal Scoops'].id,
      price: new Prisma.Decimal('160.00'),
      unit: 'scoop',
      stock: 35,
    },
    {
      name: 'Wild Berry Strawberry Swirl',
      categoryId: categories['Artisanal Scoops'].id,
      price: new Prisma.Decimal('120.00'),
      unit: 'scoop',
      stock: 40,
    },

    // Signature Royal Sundaes
    {
      name: 'Monarc Crown Jewel Sundae',
      categoryId: categories['Signature Royal Sundaes'].id,
      price: new Prisma.Decimal('280.00'),
      unit: 'piece',
      stock: 30,
    },
    {
      name: 'Chocolate Molten Volcano Sundae',
      categoryId: categories['Signature Royal Sundaes'].id,
      price: new Prisma.Decimal('260.00'),
      unit: 'piece',
      stock: 25,
    },
    {
      name: 'Nutty Caramel Crunch Delight',
      categoryId: categories['Signature Royal Sundaes'].id,
      price: new Prisma.Decimal('240.00'),
      unit: 'piece',
      stock: 35,
    },
    {
      name: 'Death By Chocolate (DBC) Classic',
      categoryId: categories['Signature Royal Sundaes'].id,
      price: new Prisma.Decimal('290.00'),
      unit: 'piece',
      stock: 40,
    },

    // Belgian Waffles & Crepes
    {
      name: 'Golden Belgian Nutella Waffle',
      categoryId: categories['Belgian Waffles & Crepes'].id,
      price: new Prisma.Decimal('220.00'),
      unit: 'piece',
      stock: 40,
    },
    {
      name: 'Triple Chocolate Overload Waffle',
      categoryId: categories['Belgian Waffles & Crepes'].id,
      price: new Prisma.Decimal('250.00'),
      unit: 'piece',
      stock: 30,
    },
    {
      name: 'Honey Butter Warm Waffle with Scoop',
      categoryId: categories['Belgian Waffles & Crepes'].id,
      price: new Prisma.Decimal('210.00'),
      unit: 'piece',
      stock: 25,
    },

    // Thick Shakes & Frosts
    {
      name: 'Ferrero Rocher Royal Thick Shake',
      categoryId: categories['Thick Shakes & Frosts'].id,
      price: new Prisma.Decimal('220.00'),
      unit: 'glass',
      stock: 50,
    },
    {
      name: 'Lotus Biscoff Caramel Shake',
      categoryId: categories['Thick Shakes & Frosts'].id,
      price: new Prisma.Decimal('230.00'),
      unit: 'glass',
      stock: 45,
    },
    {
      name: 'Rich Oreo Cream Blast Shake',
      categoryId: categories['Thick Shakes & Frosts'].id,
      price: new Prisma.Decimal('190.00'),
      unit: 'glass',
      stock: 60,
    },
    {
      name: 'Kesar Pista Royal Milkshake',
      categoryId: categories['Thick Shakes & Frosts'].id,
      price: new Prisma.Decimal('210.00'),
      unit: 'glass',
      stock: 30,
    },

    // Pastries & Warm Desserts
    {
      name: 'Sizzling Hot Sizzler Brownie with Vanilla',
      categoryId: categories['Pastries & Warm Desserts'].id,
      price: new Prisma.Decimal('240.00'),
      unit: 'piece',
      stock: 35,
    },
    {
      name: 'Warm Red Velvet Lava Cake',
      categoryId: categories['Pastries & Warm Desserts'].id,
      price: new Prisma.Decimal('200.00'),
      unit: 'piece',
      stock: 20,
    },
    {
      name: 'New York Baked Cheesecake Slice',
      categoryId: categories['Pastries & Warm Desserts'].id,
      price: new Prisma.Decimal('250.00'),
      unit: 'slice',
      stock: 15,
    },

    // Ice Cream Cakes & Tubs
    {
      name: 'Monarc Signature Truffle Ice Cream Cake (500g)',
      categoryId: categories['Ice Cream Cakes & Tubs'].id,
      price: new Prisma.Decimal('650.00'),
      unit: 'piece',
      stock: 12,
    },
    {
      name: 'Alphonso Mango Family Tub (750ml)',
      categoryId: categories['Ice Cream Cakes & Tubs'].id,
      price: new Prisma.Decimal('380.00'),
      unit: 'tub',
      stock: 20,
    },
    {
      name: 'Belgian Dark Chocolate Family Tub (750ml)',
      categoryId: categories['Ice Cream Cakes & Tubs'].id,
      price: new Prisma.Decimal('420.00'),
      unit: 'tub',
      stock: 18,
    },
  ];

  const createdItems = [];
  for (const item of itemsData) {
    const created = await prisma.item.create({ data: item });
    createdItems.push(created);
  }

  console.log(`🍨 Created ${createdItems.length} menu items.`);

  // 4. Seed initial orders for analytical demonstrations
  const order1Subtotal = new Prisma.Decimal('380.00');
  const order1Tax = new Prisma.Decimal('19.00'); // 5%
  const order1Total = new Prisma.Decimal('399.00');

  const order1 = await prisma.order.create({
    data: {
      orderNumber: '#ORD-1001',
      cashierId: cashier1.id,
      subtotal: order1Subtotal,
      tax: order1Tax,
      total: order1Total,
      paymentMode: PaymentMode.UPI,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      items: {
        create: [
          {
            itemId: createdItems[0].id, // Belgian Chocolate
            quantity: 2,
            unitPrice: createdItems[0].price,
          },
          {
            itemId: createdItems[3].id, // Butterscotch
            quantity: 1,
            unitPrice: createdItems[3].price,
          },
        ],
      },
    },
  });

  const order2Subtotal = new Prisma.Decimal('500.00');
  const order2Tax = new Prisma.Decimal('25.00');
  const order2Total = new Prisma.Decimal('525.00');

  const order2 = await prisma.order.create({
    data: {
      orderNumber: '#ORD-1002',
      cashierId: cashier2.id,
      subtotal: order2Subtotal,
      tax: order2Tax,
      total: order2Total,
      paymentMode: PaymentMode.CARD,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      items: {
        create: [
          {
            itemId: createdItems[6].id, // Monarc Crown Jewel Sundae
            quantity: 1,
            unitPrice: createdItems[6].price,
          },
          {
            itemId: createdItems[13].id, // Ferrero Thick Shake
            quantity: 1,
            unitPrice: createdItems[13].price,
          },
        ],
      },
    },
  });

  const order3Subtotal = new Prisma.Decimal('240.00');
  const order3Tax = new Prisma.Decimal('12.00');
  const order3Total = new Prisma.Decimal('252.00');

  const order3 = await prisma.order.create({
    data: {
      orderNumber: '#ORD-1003',
      cashierId: cashier1.id,
      subtotal: order3Subtotal,
      tax: order3Tax,
      total: order3Total,
      paymentMode: PaymentMode.CASH,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      items: {
        create: [
          {
            itemId: createdItems[17].id, // Sizzler Brownie
            quantity: 1,
            unitPrice: createdItems[17].price,
          },
        ],
      },
    },
  });

  console.log('🧾 Initial historical orders seeded.');
  console.log('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
