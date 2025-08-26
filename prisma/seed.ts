import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default school
  const school = await prisma.school.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Rodrise School',
      address: '123 Education Street, City',
      phone: '+1234567890',
      email: 'info@rodriseschool.com',
      website: 'https://rodriseschool.com',
      academicYear: '2024-2025',
    },
  })

  console.log('✅ School created:', school.name)

  // Create academic years
  const academicYear2024 = await prisma.academicYear.upsert({
    where: { year: '2024-2025' },
    update: {},
    create: {
      id: 'ay-2024',
      year: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      isActive: true,
    },
  })

  const academicYear2025 = await prisma.academicYear.upsert({
    where: { year: '2025-2026' },
    update: {},
    create: {
      id: 'ay-2025',
      year: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      isActive: false,
    },
  })

  console.log('✅ Academic years created')

  // Create terms
  const terms = await Promise.all([
    prisma.term.upsert({
      where: { id: 'term-1-2024' },
      update: {},
      create: {
        id: 'term-1-2024',
        name: 'Term 1',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-15'),
        academicYearId: academicYear2024.id,
        isCurrent: true,
      },
    }),
    prisma.term.upsert({
      where: { id: 'term-2-2024' },
      update: {},
      create: {
        id: 'term-2-2024',
        name: 'Term 2',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-04-15'),
        academicYearId: academicYear2024.id,
        isCurrent: false,
      },
    }),
    prisma.term.upsert({
      where: { id: 'term-3-2024' },
      update: {},
      create: {
        id: 'term-3-2024',
        name: 'Term 3',
        startDate: new Date('2025-04-16'),
        endDate: new Date('2025-06-30'),
        academicYearId: academicYear2024.id,
        isCurrent: false,
      },
    }),
  ])

  console.log('✅ Terms created')

  // Create classes
  const classes = await Promise.all([
    prisma.class.upsert({
      where: { id: 'class-9' },
      update: {},
      create: {
        id: 'class-9',
        name: 'Grade 9',
        level: 9,
        capacity: 30,
        isActive: true,
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-10' },
      update: {},
      create: {
        id: 'class-10',
        name: 'Grade 10',
        level: 10,
        capacity: 30,
        isActive: true,
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-11' },
      update: {},
      create: {
        id: 'class-11',
        name: 'Grade 11',
        level: 11,
        capacity: 30,
        isActive: true,
      },
    }),
    prisma.class.upsert({
      where: { id: 'class-12' },
      update: {},
      create: {
        id: 'class-12',
        name: 'Grade 12',
        level: 12,
        capacity: 30,
        isActive: true,
      },
    }),
  ])

  console.log('✅ Classes created')

  // Create fee types
  const feeTypes = await Promise.all([
    prisma.feeType.upsert({
      where: { id: 'fee-tuition' },
      update: {},
      create: {
        id: 'fee-tuition',
        name: 'Tuition Fee',
        description: 'Main academic tuition fee',
        isMandatory: true,
        isRecurring: true,
        frequency: 'TERM',
      },
    }),
    prisma.feeType.upsert({
      where: { id: 'fee-library' },
      update: {},
      create: {
        id: 'fee-library',
        name: 'Library Fee',
        description: 'Library and resource fee',
        isMandatory: true,
        isRecurring: true,
        frequency: 'TERM',
      },
    }),
    prisma.feeType.upsert({
      where: { id: 'fee-laboratory' },
      update: {},
      create: {
        id: 'fee-laboratory',
        name: 'Laboratory Fee',
        description: 'Science laboratory fee',
        isMandatory: true,
        isRecurring: true,
        frequency: 'TERM',
      },
    }),
    prisma.feeType.upsert({
      where: { id: 'fee-sports' },
      update: {},
      create: {
        id: 'fee-sports',
        name: 'Sports Fee',
        description: 'Sports and physical education fee',
        isMandatory: false,
        isRecurring: true,
        frequency: 'TERM',
      },
    }),
    prisma.feeType.upsert({
      where: { id: 'fee-admission' },
      update: {},
      create: {
        id: 'fee-admission',
        name: 'Admission Fee',
        description: 'One-time admission fee',
        isMandatory: true,
        isRecurring: false,
        frequency: 'ONCE',
      },
    }),
  ])

  console.log('✅ Fee types created')

  // Create fee structures for each class and fee type
  const feeStructures = []
  for (const classItem of classes) {
    for (const feeType of feeTypes) {
      if (feeType.id === 'fee-admission') {
        // Admission fee is one-time
        feeStructures.push(
          await prisma.feeStructure.create({
            data: {
              academicYearId: academicYear2024.id,
              classId: classItem.id,
              feeTypeId: feeType.id,
              amount: 500, // One-time admission fee
              term1Amount: 500,
              term2Amount: 0,
              term3Amount: 0,
              isActive: true,
            },
          })
        )
      } else {
        // Regular fees
        const baseAmount = classItem.level >= 11 ? 800 : 600 // Higher fees for senior classes
        feeStructures.push(
          await prisma.feeStructure.create({
            data: {
              academicYearId: academicYear2024.id,
              classId: classItem.id,
              feeTypeId: feeType.id,
              amount: baseAmount,
              term1Amount: baseAmount / 3,
              term2Amount: baseAmount / 3,
              term3Amount: baseAmount / 3,
              isActive: true,
            },
          })
        )
      }
    }
  }

  console.log('✅ Fee structures created')

  // Create payment methods
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.upsert({
      where: { id: 'cash' },
      update: {},
      create: {
        id: 'cash',
        name: 'Cash',
        description: 'Cash payment',
        isActive: true,
      },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'bank-transfer' },
      update: {},
      create: {
        id: 'bank-transfer',
        name: 'Bank Transfer',
        description: 'Bank transfer payment',
        isActive: true,
      },
    }),
    prisma.paymentMethod.upsert({
      where: { id: 'check' },
      update: {},
      create: {
        id: 'check',
        name: 'Check',
        description: 'Check payment',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Payment methods created')

  // Create a default admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rodriseschool.com' },
    update: {},
    create: {
      email: 'admin@rodriseschool.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQJ8KqG', // password: admin123
      isActive: true,
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
