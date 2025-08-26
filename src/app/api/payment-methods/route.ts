import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createPaymentMethodSchema = z.object({
  name: z.string().min(1, "Payment method name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
})

const updatePaymentMethodSchema = createPaymentMethodSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where,
      include: {
        _count: {
          select: {
            feePayments: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      paymentMethods
    })

  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createPaymentMethodSchema.parse(body)
    
    // Check if payment method name already exists
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        }
      }
    })
    
    if (existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment method name already exists' },
        { status: 400 }
      )
    }

    // Create payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
      include: {
        _count: {
          select: {
            feePayments: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Payment method created successfully',
      paymentMethod
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payment method:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updatePaymentMethodSchema.parse(body)
    
    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    })
    
    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Check if payment method name already exists for another method
    if (validatedData.name && validatedData.name !== existingPaymentMethod.name) {
      const duplicatePaymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: 'insensitive'
          }
        }
      })
      
      if (duplicatePaymentMethod) {
        return NextResponse.json(
          { error: 'Payment method name already exists' },
          { status: 400 }
        )
      }
    }

    // Update payment method
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isActive: validatedData.isActive,
      },
      include: {
        _count: {
          select: {
            feePayments: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Payment method updated successfully',
      paymentMethod: updatedPaymentMethod
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating payment method:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    // Check if payment method exists
    const existingPaymentMethod = await prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            feePayments: true,
          }
        }
      }
    })
    
    if (!existingPaymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Check if payment method is being used
    if (existingPaymentMethod._count.feePayments > 0) {
      return NextResponse.json(
        { error: 'Cannot delete payment method that is being used by payments' },
        { status: 400 }
      )
    }

    // Delete payment method
    await prisma.paymentMethod.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Payment method deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting payment method:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



