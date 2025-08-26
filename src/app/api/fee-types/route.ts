import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createFeeTypeSchema = z.object({
  name: z.string().min(1, "Fee type name is required"),
  description: z.string().optional(),
  isMandatory: z.boolean().default(true),
  isRecurring: z.boolean().default(true),
  frequency: z.enum(['ONCE', 'TERM', 'YEAR', 'MONTH']).default('TERM'),
})

const updateFeeTypeSchema = createFeeTypeSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const frequency = searchParams.get('frequency')

    // Build where clause
    const where: any = {}

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (frequency) {
      where.frequency = frequency
    }

    const feeTypes = await prisma.feeType.findMany({
      where,
      include: {
        _count: {
          select: {
            feeStructures: true,
            feeBalances: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      feeTypes
    })

  } catch (error) {
    console.error('Error fetching fee types:', error)
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
    const validatedData = createFeeTypeSchema.parse(body)
    
    // Check if fee type name already exists
    const existingFeeType = await prisma.feeType.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        }
      }
    })
    
    if (existingFeeType) {
      return NextResponse.json(
        { error: 'Fee type name already exists' },
        { status: 400 }
      )
    }

    // Create fee type
    const feeType = await prisma.feeType.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isMandatory: validatedData.isMandatory,
        isRecurring: validatedData.isRecurring,
        frequency: validatedData.frequency,
      },
      include: {
        _count: {
          select: {
            feeStructures: true,
            feeBalances: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Fee type created successfully',
      feeType
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating fee type:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



