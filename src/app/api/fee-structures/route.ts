import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createFeeStructureSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  classId: z.string().min(1, "Class is required"),
  feeTypeId: z.string().min(1, "Fee type is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
  term1Amount: z.number().min(0, "Term 1 amount must be non-negative").default(0),
  term2Amount: z.number().min(0, "Term 2 amount must be non-negative").default(0),
  term3Amount: z.number().min(0, "Term 3 amount must be non-negative").default(0),
  isActive: z.boolean().default(true),
})

const updateFeeStructureSchema = createFeeStructureSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYearId')
    const classId = searchParams.get('classId')
    const feeTypeId = searchParams.get('feeTypeId')
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}

    if (academicYearId) where.academicYearId = academicYearId
    if (classId) where.classId = classId
    if (feeTypeId) where.feeTypeId = feeTypeId
    if (isActive !== null) where.isActive = isActive === 'true'

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        academicYear: true,
        class: true,
        feeType: true,
      },
      orderBy: [
        { academicYear: { year: 'desc' } },
        { class: { level: 'asc' } },
        { feeType: { name: 'asc' } }
      ]
    })

    return NextResponse.json({
      feeStructures
    })

  } catch (error) {
    console.error('Error fetching fee structures:', error)
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
    const validatedData = createFeeStructureSchema.parse(body)
    
    // Check if fee structure already exists for this combination
    const existingFeeStructure = await prisma.feeStructure.findFirst({
      where: {
        academicYearId: validatedData.academicYearId,
        classId: validatedData.classId,
        feeTypeId: validatedData.feeTypeId,
      }
    })
    
    if (existingFeeStructure) {
      return NextResponse.json(
        { error: 'Fee structure already exists for this class, academic year, and fee type combination' },
        { status: 400 }
      )
    }

    // Create fee structure
    const feeStructure = await prisma.feeStructure.create({
      data: {
        academicYearId: validatedData.academicYearId,
        classId: validatedData.classId,
        feeTypeId: validatedData.feeTypeId,
        amount: validatedData.amount,
        term1Amount: validatedData.term1Amount,
        term2Amount: validatedData.term2Amount,
        term3Amount: validatedData.term3Amount,
        isActive: validatedData.isActive,
      },
      include: {
        academicYear: true,
        class: true,
        feeType: true,
      }
    })

    return NextResponse.json({
      message: 'Fee structure created successfully',
      feeStructure
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating fee structure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = updateFeeStructureSchema.parse(body)
    
    // Check if fee structure exists
    const existingFeeStructure = await prisma.feeStructure.findFirst({
      where: {
        academicYearId: validatedData.academicYearId,
        classId: validatedData.classId,
        feeTypeId: validatedData.feeTypeId,
      }
    })
    
    if (!existingFeeStructure) {
      return NextResponse.json(
        { error: 'Fee structure not found' },
        { status: 404 }
      )
    }

    // Update fee structure
    const updatedFeeStructure = await prisma.feeStructure.update({
      where: { id: existingFeeStructure.id },
      data: {
        amount: validatedData.amount,
        term1Amount: validatedData.term1Amount,
        term2Amount: validatedData.term2Amount,
        term3Amount: validatedData.term3Amount,
        isActive: validatedData.isActive,
      },
      include: {
        academicYear: true,
        class: true,
        feeType: true,
      }
    })

    return NextResponse.json({
      message: 'Fee structure updated successfully',
      feeStructure: updatedFeeStructure
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating fee structure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



