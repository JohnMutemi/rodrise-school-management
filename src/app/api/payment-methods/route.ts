import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(paymentMethods)
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, description } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Payment method name is required' },
        { status: 400 }
      )
    }

    // Check if payment method already exists
    const existingMethod = await prisma.paymentMethod.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingMethod) {
      return NextResponse.json(
        { error: 'Payment method with this name already exists' },
        { status: 400 }
      )
    }

    // Create payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name,
        description,
        isActive: true
      }
    })

    return NextResponse.json(paymentMethod, { status: 201 })
  } catch (error) {
    console.error('Error creating payment method:', error)
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    )
  }
}



