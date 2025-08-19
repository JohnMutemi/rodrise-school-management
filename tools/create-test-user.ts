import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'admin@rodrise.com'
      }
    })

    if (existingUser) {
      console.log('Test user already exists!')
      console.log('Email: admin@rodrise.com')
      console.log('Password: admin123')
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'admin@rodrise.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    })

    console.log('✅ Test user created successfully!')
    console.log('Email: admin@rodrise.com')
    console.log('Password: admin123')
    console.log('User ID:', user.id)

  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
