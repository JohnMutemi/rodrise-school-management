#!/usr/bin/env tsx

/**
 * School Management System - Admin Setup Script
 * 
 * This script sets up the initial configuration for a new school admin:
 * 1. Creates an admin user
 * 2. Sets up a school record
 * 3. Creates academic years
 * 4. Sets up default classes
 * 5. Creates fee types and structures
 * 
 * Usage: npm run setup-admin
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { stdin as input, stdout as output } from 'process'
import * as readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({ input, output })

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

async function setupAdmin() {
  console.log('🎓 Rodrise School Management System - Initial Setup')
  console.log('=' * 50)
  
  try {
    // 1. Create Admin User
    console.log('\n📋 Step 1: Creating Admin User')
    const email = await question('Enter admin email: ')
    const password = await question('Enter admin password: ')
    const firstName = await question('Enter first name: ')
    const lastName = await question('Enter last name: ')
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: 'ADMIN',
        isActive: true
      }
    })
    
    console.log(`✅ Admin user created: ${adminUser.email}`)
    
    // 2. Create School
    console.log('\n🏫 Step 2: Setting up School')
    const schoolName = await question('Enter school name: ')
    const schoolAddress = await question('Enter school address: ')
    const schoolPhone = await question('Enter school phone: ')
    const schoolEmail = await question('Enter school email: ')
    
    const school = await prisma.school.upsert({
      where: { id: 'default-school' },
      update: {},
      create: {
        id: 'default-school',
        name: schoolName,
        address: schoolAddress,
        phone: schoolPhone,
        email: schoolEmail,
        academicYear: '2024/2025'
      }
    })
    
    console.log(`✅ School created: ${school.name}`)
    
    // 3. Create Academic Years
    console.log('\n📅 Step 3: Setting up Academic Years')
    const currentYear = new Date().getFullYear()
    
    const academicYears = [
      {
        year: `${currentYear}/${currentYear + 1}`,
        startDate: new Date(`${currentYear}-09-01`),
        endDate: new Date(`${currentYear + 1}-08-31`),
        isCurrent: true,
        isActive: true
      },
      {
        year: `${currentYear + 1}/${currentYear + 2}`,
        startDate: new Date(`${currentYear + 1}-09-01`),
        endDate: new Date(`${currentYear + 2}-08-31`),
        isCurrent: false,
        isActive: true
      }
    ]
    
    for (const yearData of academicYears) {
      await prisma.academicYear.upsert({
        where: { year: yearData.year },
        update: {},
        create: yearData
      })
    }
    
    console.log(`✅ Academic years created: ${academicYears.map(y => y.year).join(', ')}`)
    
    // 4. Create Terms
    console.log('\n📚 Step 4: Setting up Terms')
    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true }
    })
    
    if (activeAcademicYear) {
      const terms = [
        {
          name: 'Term 1',
          startDate: new Date(`${currentYear}-09-01`),
          endDate: new Date(`${currentYear}-12-15`),
          isCurrent: true
        },
        {
          name: 'Term 2',
          startDate: new Date(`${currentYear + 1}-01-15`),
          endDate: new Date(`${currentYear + 1}-04-15`),
          isCurrent: false
        },
        {
          name: 'Term 3',
          startDate: new Date(`${currentYear + 1}-05-01`),
          endDate: new Date(`${currentYear + 1}-08-31`),
          isCurrent: false
        }
      ]
      
      for (const termData of terms) {
        await prisma.term.upsert({
          where: { 
            academicYearId_name: { 
              academicYearId: activeAcademicYear.id, 
              name: termData.name 
            } 
          },
          update: {},
          create: {
            ...termData,
            academicYearId: activeAcademicYear.id
          }
        })
      }
      
      console.log(`✅ Terms created for academic year ${activeAcademicYear.year}`)
    }
    
    // 5. Create Default Classes
    console.log('\n🎓 Step 5: Setting up Classes')
    const defaultClasses = [
      { name: 'Nursery', level: 0 },
      { name: 'Pre-Unit', level: 1 },
      { name: 'Class 1', level: 1 },
      { name: 'Class 2', level: 2 },
      { name: 'Class 3', level: 3 },
      { name: 'Class 4', level: 4 },
      { name: 'Class 5', level: 5 },
      { name: 'Class 6', level: 6 },
      { name: 'Class 7', level: 7 },
      { name: 'Class 8', level: 8 }
    ]
    
    for (const classData of defaultClasses) {
      await prisma.class.upsert({
        where: { name: classData.name },
        update: {},
        create: {
          ...classData,
          capacity: 40,
          isActive: true
        }
      })
    }
    
    console.log(`✅ Classes created: ${defaultClasses.map(c => c.name).join(', ')}`)
    
    // 6. Create Fee Types
    console.log('\n💰 Step 6: Setting up Fee Types')
    const feeTypes = [
      { name: 'Tuition Fee', description: 'Regular tuition fees', isMandatory: true, frequency: 'TERM' },
      { name: 'Admission Fee', description: 'One-time admission fee', isMandatory: true, frequency: 'ONCE' },
      { name: 'Exam Fee', description: 'Examination fees', isMandatory: true, frequency: 'TERM' },
      { name: 'Activity Fee', description: 'Co-curricular activities', isMandatory: false, frequency: 'TERM' },
      { name: 'Transport Fee', description: 'School transport', isMandatory: false, frequency: 'TERM' },
      { name: 'Uniform Fee', description: 'School uniform', isMandatory: false, frequency: 'YEAR' },
      { name: 'Book Fee', description: 'Textbooks and materials', isMandatory: true, frequency: 'YEAR' },
      { name: 'Development Fee', description: 'School development fund', isMandatory: true, frequency: 'YEAR' }
    ]
    
    for (const feeType of feeTypes) {
      await prisma.feeType.upsert({
        where: { name: feeType.name },
        update: {},
        create: {
          ...feeType,
          frequency: feeType.frequency as any
        }
      })
    }
    
    console.log(`✅ Fee types created: ${feeTypes.map(f => f.name).join(', ')}`)
    
    // 7. Create Payment Methods
    console.log('\n💳 Step 7: Setting up Payment Methods')
    const paymentMethods = [
      { name: 'Cash', description: 'Cash payment' },
      { name: 'Bank Transfer', description: 'Direct bank transfer' },
      { name: 'Mobile Money', description: 'Mobile money transfer' },
      { name: 'Cheque', description: 'Bank cheque' },
      { name: 'Card', description: 'Credit/Debit card' }
    ]
    
    for (const method of paymentMethods) {
      await prisma.paymentMethod.upsert({
        where: { name: method.name },
        update: {},
        create: method
      })
    }
    
    console.log(`✅ Payment methods created: ${paymentMethods.map(m => m.name).join(', ')}`)
    
    console.log('\n🎉 Initial setup completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Set up fee structures for each class')
    console.log('2. Import or add students')
    console.log('3. Start processing payments')
    console.log('\nYou can now login with:')
    console.log(`Email: ${email}`)
    console.log('Password: [the password you entered]')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupAdmin()
}

export { setupAdmin }

