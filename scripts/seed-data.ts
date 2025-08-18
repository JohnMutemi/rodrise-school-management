import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create or find a school
  let school = await prisma.school.findFirst({
    where: { name: 'Rodrise Education' }
  })
  
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: 'Rodrise Education',
        address: '123 Education Street, Nairobi, Kenya',
        phone: '+254 700 000 000',
        email: 'info@rodrise.edu.ke',
        website: 'https://rodrise.edu.ke',
        academicYear: '2024-2025'
      }
    })
  }

  console.log('✅ Created school:', school.name)

  // Create or find a branch
  let branch = await prisma.branch.findFirst({
    where: { 
      name: 'Main Campus',
      schoolId: school.id
    }
  })
  
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'Main Campus',
        address: '123 Education Street, Nairobi, Kenya',
        phone: '+254 700 000 001',
        email: 'main@rodrise.edu.ke',
        schoolId: school.id
      }
    })
  }

  console.log('✅ Created branch:', branch.name)

  // Create or find academic year
  let academicYear = await prisma.academicYear.findUnique({
    where: { year: '2024-2025' }
  })
  
  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        year: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-07-31'),
        isActive: true
      }
    })
  }

  console.log('✅ Created academic year:', academicYear.year)

  // Create terms
  const termNames = ['Term 1', 'Term 2', 'Term 3']
  const termDates = [
    { startDate: new Date('2024-09-01'), endDate: new Date('2024-12-20') },
    { startDate: new Date('2025-01-06'), endDate: new Date('2025-04-04') },
    { startDate: new Date('2025-04-28'), endDate: new Date('2025-07-31') }
  ]
  
  const terms = []
  for (let i = 0; i < termNames.length; i++) {
    let term = await prisma.term.findFirst({
      where: {
        name: termNames[i],
        academicYearId: academicYear.id
      }
    })
    
    if (!term) {
      term = await prisma.term.create({
        data: {
          name: termNames[i],
          startDate: termDates[i].startDate,
          endDate: termDates[i].endDate,
          academicYearId: academicYear.id
        }
      })
    }
    terms.push(term)
  }

  console.log('✅ Created terms:', terms.map(t => t.name))

  // Create classes
  const classData = [
    { name: 'Grade 1A', level: 1 },
    { name: 'Grade 2A', level: 2 },
    { name: 'Grade 3A', level: 3 },
    { name: 'Grade 4A', level: 4 },
    { name: 'Grade 5A', level: 5 },
    { name: 'Grade 6A', level: 6 }
  ]
  
  const classes = []
  for (const classInfo of classData) {
    let classRecord = await prisma.class.findFirst({
      where: { name: classInfo.name }
    })
    
    if (!classRecord) {
      classRecord = await prisma.class.create({
        data: {
          name: classInfo.name,
          level: classInfo.level,
          capacity: 40
        }
      })
    }
    classes.push(classRecord)
  }

  console.log('✅ Created classes:', classes.map(c => c.name))

  // Create fee types
  const feeTypeData = [
    {
      name: 'Tuition Fee',
      description: 'Main academic tuition fee',
      frequency: 'TERM' as const
    },
    {
      name: 'Development Fee',
      description: 'School development and infrastructure fee',
      frequency: 'YEAR' as const
    },
    {
      name: 'Library Fee',
      description: 'Library and learning resources fee',
      frequency: 'YEAR' as const
    },
    {
      name: 'Sports Fee',
      description: 'Sports and physical education fee',
      frequency: 'YEAR' as const
    }
  ]
  
  const feeTypes = []
  for (const feeTypeInfo of feeTypeData) {
    let feeType = await prisma.feeType.findFirst({
      where: { name: feeTypeInfo.name }
    })
    
    if (!feeType) {
      feeType = await prisma.feeType.create({
        data: feeTypeInfo
      })
    }
    feeTypes.push(feeType)
  }

  console.log('✅ Created fee types:', feeTypes.map(ft => ft.name))

  // Create payment methods
  const paymentMethodData = [
    { name: 'Cash', description: 'Cash payment' },
    { name: 'Bank Transfer', description: 'Direct bank transfer' },
    { name: 'Mobile Money', description: 'M-Pesa, Airtel Money, etc.' },
    { name: 'Cheque', description: 'Bank cheque payment' }
  ]
  
  const paymentMethods = []
  for (const methodInfo of paymentMethodData) {
    let method = await prisma.paymentMethod.findFirst({
      where: { name: methodInfo.name }
    })
    
    if (!method) {
      method = await prisma.paymentMethod.create({
        data: methodInfo
      })
    }
    paymentMethods.push(method)
  }

  console.log('✅ Created payment methods:', paymentMethods.map(pm => pm.name))

  // Create fee structures
  const feeStructureData = [
    {
      classId: classes[0].id, // Grade 1A
      feeTypeId: feeTypes[0].id, // Tuition Fee
      academicYearId: academicYear.id,
      amount: 45000, // Total annual amount
      term1Amount: 15000,
      term2Amount: 15000,
      term3Amount: 15000
    },
    {
      classId: classes[0].id, // Grade 1A
      feeTypeId: feeTypes[1].id, // Development Fee
      academicYearId: academicYear.id,
      amount: 5000, // Total annual amount
      term1Amount: 5000,
      term2Amount: 0,
      term3Amount: 0
    },
    {
      classId: classes[1].id, // Grade 2A
      feeTypeId: feeTypes[0].id, // Tuition Fee
      academicYearId: academicYear.id,
      amount: 48000, // Total annual amount
      term1Amount: 16000,
      term2Amount: 16000,
      term3Amount: 16000
    }
  ]
  
  const feeStructures = []
  for (const structureInfo of feeStructureData) {
    let structure = await prisma.feeStructure.findFirst({
      where: {
        classId: structureInfo.classId,
        feeTypeId: structureInfo.feeTypeId,
        academicYearId: structureInfo.academicYearId
      }
    })
    
    if (!structure) {
      structure = await prisma.feeStructure.create({
        data: structureInfo
      })
    }
    feeStructures.push(structure)
  }

  console.log('✅ Created fee structures')

  // Create students
  const studentData = [
    {
      admissionNumber: '2024-001',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('2013-03-15'),
      gender: 'MALE' as const,
      classId: classes[0].id, // Grade 1A
      schoolId: school.id,
      academicYearId: academicYear.id,
      parentName: 'Jane Doe',
      parentPhone: '+254 700 123 457',
      parentEmail: 'jane.doe@email.com',
      address: '123 Main Street, Nairobi'
    },
    {
      admissionNumber: '2024-002',
      firstName: 'Sarah',
      lastName: 'Smith',
      dateOfBirth: new Date('2012-07-22'),
      gender: 'FEMALE' as const,
      classId: classes[1].id, // Grade 2A
      schoolId: school.id,
      academicYearId: academicYear.id,
      parentName: 'Mike Smith',
      parentPhone: '+254 700 234 568',
      parentEmail: 'mike.smith@email.com',
      address: '456 Oak Avenue, Nairobi'
    },
    {
      admissionNumber: '2024-003',
      firstName: 'Michael',
      lastName: 'Johnson',
      dateOfBirth: new Date('2011-11-08'),
      gender: 'MALE' as const,
      classId: classes[2].id, // Grade 3A
      schoolId: school.id,
      academicYearId: academicYear.id,
      parentName: 'Lisa Johnson',
      parentPhone: '+254 700 345 679',
      parentEmail: 'lisa.johnson@email.com',
      address: '789 Pine Road, Nairobi'
    }
  ]
  
  const students = []
  for (const studentInfo of studentData) {
    let student = await prisma.student.findUnique({
      where: { admissionNumber: studentInfo.admissionNumber }
    })
    
    if (!student) {
      student = await prisma.student.create({
        data: studentInfo
      })
    }
    students.push(student)
  }

  console.log('✅ Created students:', students.map(s => `${s.firstName} ${s.lastName}`))

  // Create a school admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  let adminUser = await prisma.user.findUnique({
    where: { email: 'admin@rodrise.edu.ke' }
  })
  
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        firstName: 'School',
        lastName: 'Admin',
        email: 'admin@rodrise.edu.ke',
        passwordHash: hashedPassword,
        role: 'ADMIN'
      }
    })
  }

  console.log('✅ Created admin user:', adminUser.email)

  // Create some fee balances
  const feeBalanceData = [
    {
      studentId: students[0].id,
      academicYearId: academicYear.id,
      termId: terms[0].id, // Term 1
      feeTypeId: feeTypes[0].id, // Tuition Fee
      amountCharged: 15000,
      amountPaid: 10000,
      balance: 5000
    },
    {
      studentId: students[1].id,
      academicYearId: academicYear.id,
      termId: terms[0].id, // Term 1
      feeTypeId: feeTypes[0].id, // Tuition Fee
      amountCharged: 16000,
      amountPaid: 16000,
      balance: 0
    }
  ]
  
  const feeBalances = []
  for (const balanceInfo of feeBalanceData) {
    let balance = await prisma.feeBalance.findFirst({
      where: {
        studentId: balanceInfo.studentId,
        academicYearId: balanceInfo.academicYearId,
        termId: balanceInfo.termId,
        feeTypeId: balanceInfo.feeTypeId
      }
    })
    
    if (!balance) {
      balance = await prisma.feeBalance.create({
        data: balanceInfo
      })
    }
    feeBalances.push(balance)
  }

  console.log('✅ Created fee balances')

  // Create some payments
  const paymentData = [
    {
      studentId: students[0].id,
      academicYearId: academicYear.id,
      termId: terms[0].id, // Term 1
      paymentDate: new Date('2024-09-15'),
      receiptNumber: 'RCP-2024-001',
      amountPaid: 10000,
      paymentMethodId: paymentMethods[2].id, // Mobile Money
      referenceNumber: 'MPESA123456',
      notes: 'Term 1 Tuition Fee Payment',
      createdBy: adminUser.id
    },
    {
      studentId: students[1].id,
      academicYearId: academicYear.id,
      termId: terms[0].id, // Term 1
      paymentDate: new Date('2024-09-10'),
      receiptNumber: 'RCP-2024-002',
      amountPaid: 16000,
      paymentMethodId: paymentMethods[1].id, // Bank Transfer
      referenceNumber: 'BANK789012',
      notes: 'Term 1 Tuition Fee Payment',
      createdBy: adminUser.id
    }
  ]
  
  const payments = []
  for (const paymentInfo of paymentData) {
    let payment = await prisma.feePayment.findUnique({
      where: { receiptNumber: paymentInfo.receiptNumber }
    })
    
    if (!payment) {
      payment = await prisma.feePayment.create({
        data: paymentInfo
      })
    }
    payments.push(payment)
  }

  console.log('✅ Created payments')

  // Create payment details for the payments
  const paymentDetailData = [
    {
      paymentId: payments[0].id,
      feeTypeId: feeTypes[0].id, // Tuition Fee
      amount: 10000
    },
    {
      paymentId: payments[1].id,
      feeTypeId: feeTypes[0].id, // Tuition Fee
      amount: 16000
    }
  ]
  
  const paymentDetails = []
  for (const detailInfo of paymentDetailData) {
    let detail = await prisma.paymentDetail.findFirst({
      where: {
        paymentId: detailInfo.paymentId,
        feeTypeId: detailInfo.feeTypeId
      }
    })
    
    if (!detail) {
      detail = await prisma.paymentDetail.create({
        data: detailInfo
      })
    }
    paymentDetails.push(detail)
  }

  console.log('✅ Created payment details')

  console.log('🎉 Database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`- School: ${school.name}`)
  console.log(`- Branch: ${branch.name}`)
  console.log(`- Academic Year: ${academicYear.year}`)
  console.log(`- Terms: ${terms.length}`)
  console.log(`- Classes: ${classes.length}`)
  console.log(`- Fee Types: ${feeTypes.length}`)
  console.log(`- Payment Methods: ${paymentMethods.length}`)
  console.log(`- Students: ${students.length}`)
  console.log(`- Admin User: ${adminUser.email} (password: admin123)`)
  console.log(`- Fee Balances: ${feeBalances.length}`)
  console.log(`- Payments: ${payments.length}`)
  console.log(`- Payment Details: ${paymentDetails.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })




