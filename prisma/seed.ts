import { PrismaClient, AccountType, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a tailor user if none exists
  const tailorUser = await prisma.user.upsert({
    where: { email: 'tailor@example.com' },
    update: {},
    create: {
      email: 'tailor@example.com',
      firstName: 'Tailor',
      lastName: 'Demo',
      phone: '+1234567890',
      accountType: AccountType.TAILOR,
    },
  });

  // Create a customer user if none exists
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      firstName: 'Customer',
      lastName: 'Demo',
      phone: '+9876543210',
      accountType: AccountType.USER,
    },
  });

  console.log(`Created users: ${tailorUser.id}, ${customerUser.id}`);

  // Create sample orders
  const orders = [
    {
      orderNumber: 'ORD001',
      customerName: `${customerUser.firstName} ${customerUser.lastName}`,
      userId: customerUser.id,
      tailorId: tailorUser.id,
      status: OrderStatus.PENDING,
      price: 10.00,
      txHash: '0xabc123456789def',
      description: 'Custom tailored shirt',
    },
    {
      orderNumber: 'ORD002',
      customerName: `${customerUser.firstName} ${customerUser.lastName}`,
      userId: customerUser.id,
      tailorId: tailorUser.id,
      status: OrderStatus.COMPLETED,
      price: 15.00,
      txHash: '0xdef456789abc123',
      description: 'Custom pants',
    },
    {
      orderNumber: 'ORD003',
      customerName: `${customerUser.firstName} ${customerUser.lastName}`,
      userId: customerUser.id,
      tailorId: tailorUser.id,
      status: OrderStatus.ACCEPTED,
      price: 20.00,
      txHash: '0x789abc123def456',
      description: 'Wedding suit',
    },
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { orderNumber: order.orderNumber },
      update: order,
      create: order,
    });
  }

  console.log(`Seeded ${orders.length} orders`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 