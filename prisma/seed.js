const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...\n');

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
      firstname: 'Admin',
      lastname: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✓ Admin user created:', admin.email);

  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@ideabox.com' },
    update: {},
    create: {
      email: 'manager@ideabox.com',
      password: managerPassword,
      firstname: 'Manager',
      lastname: 'User',
      role: 'MANAGER',
      isActive: true,
    },
  });
  console.log('✓ Manager user created:', manager.email);

  const userPassword = await bcrypt.hash('User@123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@ideabox.com' },
    update: {},
    create: {
      email: 'user@ideabox.com',
      password: userPassword,
      firstname: 'Regular',
      lastname: 'User',
      role: 'USER',
      isActive: true,
    },
  });
  console.log('✓ Regular user created:', user.email);

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
  // STATUSES
  // ============================================
  console.log('\nCreating statuses...');

  const statuses = await Promise.all([
    prisma.status.upsert({
      where: { name: 'Submitted' },
      update: {},
      create: {
        name: 'Submitted',
        order: 1,
        color: '#3B82F6',
        description: 'Idea has been submitted',
      },
    }),
    prisma.status.upsert({
      where: { name: 'Under Review' },
      update: {},
      create: {
        name: 'Under Review',
        order: 2,
        color: '#F59E0B',
        description: 'Idea is being reviewed',
      },
    }),
    prisma.status.upsert({
      where: { name: 'Approved' },
      update: {},
      create: {
        name: 'Approved',
        order: 3,
        color: '#10B981',
        description: 'Idea has been approved',
      },
    }),
    prisma.status.upsert({
      where: { name: 'In Progress' },
      update: {},
      create: {
        name: 'In Progress',
        order: 4,
        color: '#8B5CF6',
        description: 'Idea is being implemented',
      },
    }),
    prisma.status.upsert({
      where: { name: 'Completed' },
      update: {},
      create: {
        name: 'Completed',
        order: 5,
        color: '#059669',
        description: 'Idea has been implemented',
      },
    }),
    prisma.status.upsert({
      where: { name: 'Rejected' },
      update: {},
      create: {
        name: 'Rejected',
        order: 6,
        color: '#EF4444',
        description: 'Idea has been rejected',
      },
    }),
  ]);
  console.log(`✓ ${statuses.length} statuses created`);

  // ============================================
  // FORM MODELS & VARIANTS
  // ============================================
  console.log('\nCreating form models and variants...');

  const formModel = await prisma.formModel.upsert({
    where: { name: 'Standard Idea Form' },
    update: {},
    create: {
      name: 'Standard Idea Form',
      description: 'Standard form for submitting ideas',
      isActive: true,
    },
  });
  console.log('✓ Form model created:', formModel.name);

  const formVariant = await prisma.formVariant.upsert({
    where: { 
      modelId_name: {
        modelId: formModel.id,
        name: 'Default Variant'
      }
    },
    update: {},
    create: {
      modelId: formModel.id,
      name: 'Default Variant',
      description: 'Default form variant with standard fields',
      isDefault: true,
      isActive: true,
    },
  });
  console.log('✓ Form variant created:', formVariant.name);

  // ============================================
  // FORM FIELDS
  // ============================================
  console.log('\nCreating form fields...');

  const fields = await Promise.all([
    prisma.formField.create({
      data: {
        variantId: formVariant.id,
        label: 'Idea Title',
        type: 'TEXT',
        required: true,
        placeholder: 'Enter a concise title for your idea',
        order: 1,
      },
    }),
    prisma.formField.create({
      data: {
        variantId: formVariant.id,
        label: 'Description',
        type: 'TEXTAREA',
        required: true,
        placeholder: 'Describe your idea in detail',
        helpText: 'Provide as much detail as possible',
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
        label: 'Implementation Difficulty',
        type: 'SELECT',
        required: false,
        options: {
          choices: ['Easy', 'Medium', 'Hard', 'Very Hard']
        },
        order: 4,
      },
    }),
  ]);
  console.log(`✓ ${fields.length} form fields created`);

  // ============================================
  // SAMPLE IDEAS
  // ============================================
  console.log('\nCreating sample ideas...');

  const idea1 = await prisma.idea.create({
    data: {
      title: 'Implement AI-powered customer support',
      description: 'Use AI chatbots to handle common customer queries and reduce response time',
      categoryId: categories[4].id, // Technology
      statusId: statuses[1].id, // Under Review
      urgency: 'HIGH',
      impact: 'VERY_HIGH',
      isAnonymous: false,
      userId: user.id,
      formVariantId: formVariant.id,
    },
  });
  console.log('✓ Sample idea 1 created:', idea1.title);

  const idea2 = await prisma.idea.create({
    data: {
      title: 'Reduce packaging waste',
      description: 'Switch to biodegradable packaging materials to reduce environmental impact',
      categoryId: categories[2].id, // Cost Reduction
      statusId: statuses[2].id, // Approved
      urgency: 'MEDIUM',
      impact: 'HIGH',
      isAnonymous: false,
      userId: manager.id,
      formVariantId: formVariant.id,
    },
  });
  console.log('✓ Sample idea 2 created:', idea2.title);

  // ============================================
  // PLAN ACTIONS
  // ============================================
  console.log('\nCreating plan actions...');

  const action1 = await prisma.planAction.create({
    data: {
      ideaId: idea2.id,
      title: 'Research biodegradable materials',
      description: 'Find suitable biodegradable packaging suppliers',
      progress: 30,
      deadline: new Date('2024-03-31'),
      assignedTo: manager.id,
    },
  });
  console.log('✓ Plan action created:', action1.title);

  const action2 = await prisma.planAction.create({
    data: {
      ideaId: idea2.id,
      title: 'Cost-benefit analysis',
      description: 'Analyze costs vs environmental benefits',
      progress: 0,
      deadline: new Date('2024-04-15'),
      assignedTo: admin.id,
    },
  });
  console.log('✓ Plan action created:', action2.title);

  // ============================================
  // COMMENTS
  // ============================================
  console.log('\nCreating comments...');

  const comment1 = await prisma.comment.create({
    data: {
      ideaId: idea1.id,
      userId: manager.id,
      content: 'Great idea! This could significantly improve our customer satisfaction scores.',
    },
  });
  console.log('✓ Comment created');

  const comment2 = await prisma.comment.create({
    data: {
      ideaId: idea2.id,
      userId: admin.id,
      content: 'I approve this initiative. Let\'s move forward with the research phase.',
    },
  });
  console.log('✓ Comment created');

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('Seed completed successfully!');
  console.log('='.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   Users: 3`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Statuses: ${statuses.length}`);
  console.log(`   Form Models: 1`);
  console.log(`   Form Variants: 1`);
  console.log(`   Form Fields: ${fields.length}`);
  console.log(`   Ideas: 2`);
  console.log(`   Plan Actions: 2`);
  console.log(`   Comments: 2`);
  
  console.log('\n🔐 Test credentials:');
  console.log('   Admin:   admin@ideabox.com / Admin@123');
  console.log('   Manager: manager@ideabox.com / Manager@123');
  console.log('   User:    user@ideabox.com / User@123');
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
