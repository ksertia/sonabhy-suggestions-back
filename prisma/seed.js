const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting corrected database seed...\n');

  // ============================================
  // USERS
  // ============================================
  console.log('Creating users...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ideabox.com' },
    update: {},
    create: {
      email: 'admin@ideabox.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin1',
      phone: '64000000',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@ideabox.com' },
    update: {},
    create: {
      email: 'manager@ideabox.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      username: 'manager1',
      phone: '65000000',
      role: 'MANAGER',
      isActive: true,
    },
  });

  const userPassword = await bcrypt.hash('User@123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@ideabox.com' },
    update: {},
    create: {
      email: 'user@ideabox.com',
      password: userPassword,
      firstName: 'Regular',
      lastName: 'User',
      username: 'user1',
      phone: '66000000',
      role: 'USER',
      isActive: true,
    },
  });

  console.log('✓ Users created');

  // ============================================
  // CATEGORIES
  // ============================================
  console.log('\nCreating categories...');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Innovation' },
      update: {},
      create: {
        name: 'Innovation',
        description: 'New product ideas and innovations',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Process Improvement' },
      update: {},
      create: {
        name: 'Process Improvement',
        description: 'Ideas to improve existing processes',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Cost Reduction' },
      update: {},
      create: {
        name: 'Cost Reduction',
        description: 'Ideas to reduce costs and increase efficiency',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Customer Experience' },
      update: {},
      create: {
        name: 'Customer Experience',
        description: 'Ideas to improve customer satisfaction',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Technology' },
      update: {},
      create: {
        name: 'Technology',
        description: 'Technology-related improvements',
      },
    }),
  ]);

  console.log(`✓ ${categories.length} categories created`);

  // ============================================
  // FORM MODEL & VARIANT
  // ============================================
  console.log('\nCreating form model and variant...');

  const formModel = await prisma.formModel.upsert({
    where: { name: 'Standard Idea Form' },
    update: {},
    create: {
      name: 'Standard Idea Form',
      description: 'Standard form for submitting ideas',
      isActive: true,
    },
  });

  const formVariant = await prisma.formVariant.upsert({
    where: {
      modelId_name: {
        modelId: formModel.id,
        name: 'Default Variant',
      },
    },
    update: {},
    create: {
      modelId: formModel.id,
      name: 'Default Variant',
      description: 'Default variant for idea submission',
      isDefault: true,
      isActive: true,
    },
  });

  console.log('✓ Form model & variant created');

  // ============================================
  // FORM FIELDS
  // ============================================
  console.log('\nCreating form fields...');

  await prisma.formField.deleteMany({ where: { variantId: formVariant.id } });

  const fields = await Promise.all([
    prisma.formField.create({
      data: {
        variantId: formVariant.id,
        label: 'Idea Title',
        type: 'TEXT',
        required: true,
        placeholder: 'Enter a concise title',
        order: 1,
      },
    }),
    prisma.formField.create({
      data: {
        variantId: formVariant.id,
        label: 'Description',
        type: 'TEXTAREA',
        required: true,
        placeholder: 'Describe your idea',
        order: 2,
      },
    }),
    prisma.formField.create({
      data: {
        variantId: formVariant.id,
        label: 'Expected Benefits',
        type: 'TEXTAREA',
        required: false,
        placeholder: 'What benefits will this idea bring?',
        order: 3,
      },
    }),
    prisma.formField.create({
      data: {
        variantId: formVariant.id,
        label: 'Difficulty',
        type: 'SELECT',
        required: false,
        options: { choices: ['Easy', 'Medium', 'Hard'] },
        order: 4,
      },
    }),
  ]);

  console.log(`✓ ${fields.length} form fields created`);

  // ============================================
  // IDEAS
  // ============================================
  console.log('\nCreating ideas...');

  const idea1 = await prisma.idea.create({
    data: {
      title: 'Implement AI-powered customer support',
      description: 'Use AI chatbots to handle common customer queries and reduce response time.',
      categoryId: categories[4].id,
      priority: 'HIGH',
      impact: 'MAJOR',
      isAnonymous: false,
      visibility: 'PUBLIC',
      userId: user.id,
      formVariantId: formVariant.id,
      status: 'SUBMITTED',
    },
  });

  const idea2 = await prisma.idea.create({
    data: {
      title: 'Reduce packaging waste',
      description: 'Switch to biodegradable packaging materials.',
      categoryId: categories[2].id,
      priority: 'MEDIUM',
      impact: 'MODERATE',
      visibility: 'TEAM',
      userId: manager.id,
      formVariantId: formVariant.id,
      status: 'APPROVED',
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });

  console.log('✓ Ideas created');

  // ============================================
  // PLAN ACTIONS
  // ============================================
  console.log('\nCreating plan actions...');

  const action1 = await prisma.planAction.create({
    data: {
      ideaId: idea2.id,
      title: 'Research biodegradable materials',
      description: 'Find suitable biodegradable packaging suppliers.',
      progress: 30,
      deadline: new Date('2025-03-15'),
      assignedTo: manager.id,
    },
  });

  const action2 = await prisma.planAction.create({
    data: {
      ideaId: idea2.id,
      title: 'Cost-benefit analysis',
      description: 'Analyze the financial impact of switching materials.',
      progress: 0,
      deadline: new Date('2025-04-10'),
      assignedTo: admin.id,
    },
  });

  // ============================================
  // COMMENTS
  // ============================================
  console.log('\nCreating comments...');

  await prisma.comment.create({
    data: {
      ideaId: idea1.id,
      userId: manager.id,
      content: 'Great idea! It will improve response time drastically.',
    },
  });

  await prisma.comment.create({
    data: {
      ideaId: idea2.id,
      userId: admin.id,
      content: 'Approved. Let’s begin with supplier research.',
    },
  });

  console.log('✓ Comments created');

  // ============================================
// NOTIFICATIONS
// ============================================
console.log('\nCreating notifications...');

// Notification pour un utilisateur
await prisma.notification.create({
  data: {
    title: "Idée approuvée",
    message: "Votre idée a été approuvée par un manager.",
    type: "SUCCESS",
    target: "USER",
    userId: user.id,
    entityId: idea1.id,
    entityType: "IDEA",
  },
});

// Notification pour un rôle (MANAGER)
await prisma.notification.create({
  data: {
    title: "Nouvelle idée soumise",
    message: "Une nouvelle idée est en attente de validation.",
    type: "INFO",
    target: "ROLE",
    role: "MANAGER",
    entityId: idea2.id,
    entityType: "IDEA",
  },
});

// Notification système
await prisma.notification.create({
  data: {
    title: "Mise à jour du système",
    message: "Le système a été mis à jour avec une nouvelle fonctionnalité.",
    type: "INFO",
    target: "SYSTEM",
  },
});

console.log("✓ Notifications seeded");


  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('SEED COMPLETED SUCCESSFULLY');
  console.log('='.repeat(50));

  console.log(`
Users: 3
Categories: ${categories.length}
Form fields: ${fields.length}
Ideas: 2
Actions: 2
Comments: 2

🔐 Test Accounts:
Admin → admin@ideabox.com / Admin@123
Manager → manager@ideabox.com / Manager@123
User → user@ideabox.com / User@123
  `);
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
