import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createFeeBalanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  termId: z.string().optional(),
  feeTypeId: z.string().min(1, "Fee type is required"),
  amountCharged: z.number().min(0, "Amount charged must be non-negative"),
  amountPaid: z.number().min(0, "Amount paid must be non-negative").default(0),
  balance: z.number().min(0, "Balance must be non-negative").default(0),
})

const updateFeeBalanceSchema = createFeeBalanceSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const academicYearId = searchParams.get('academicYearId')
    const termId = searchParams.get('termId')
    const feeTypeId = searchParams.get('feeTypeId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (studentId) where.studentId = studentId
    if (academicYearId) where.academicYearId = academicYearId
    if (termId) where.termId = termId
    if (feeTypeId) where.feeTypeId = feeTypeId

    // Filter by balance status
    if (status) {
      switch (status) {
        case 'paid':
          where.balance = { lte: 0 }
          break
        case 'unpaid':
          where.balance = { gt: 0 }
          break
        case 'partial':
          where.AND = [
            { amountPaid: { gt: 0 } },
            { balance: { gt: 0 } }
          ]
          break
      }
    }

    // Get fee balances with related data
    const [feeBalances, total] = await Promise.all([
      prisma.feeBalance.findMany({
        where,
        include: {
          student: {
            include: {
              class: true,
              academicYear: true,
            }
          },
          academicYear: true,
          term: true,
          feeType: true,
        },
        orderBy: [
          { student: { firstName: 'asc' } },
          { student: { lastName: 'asc' } },
          { feeType: { name: 'asc' } }
        ],
        skip,
        take: limit,
      }),
      prisma.feeBalance.count({ where })
    ])

    // Calculate additional statistics
    const totalCharged = feeBalances.reduce((sum, balance) => 
      sum + parseFloat(balance.amountCharged.toString()), 0
    )
    const totalPaid = feeBalances.reduce((sum, balance) => 
      sum + parseFloat(balance.amountPaid.toString()), 0
    )
    const totalOutstanding = feeBalances.reduce((sum, balance) => 
      sum + parseFloat(balance.balance.toString()), 0
    )

    return NextResponse.json({
      feeBalances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        totalCharged,
        totalPaid,
        totalOutstanding,
        totalRecords: total
      }
    })

  } catch (error) {
    console.error('Error fetching fee balances:', error)
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
    const validatedData = createFeeBalanceSchema.parse(body)
    
    // Check if fee balance already exists for this combination
    const existingBalance = await prisma.feeBalance.findFirst({
      where: {
        studentId: validatedData.studentId,
        academicYearId: validatedData.academicYearId,
        termId: validatedData.termId,
        feeTypeId: validatedData.feeTypeId,
      }
    })
    
    if (existingBalance) {
      return NextResponse.json(
        { error: 'Fee balance already exists for this student, academic year, term, and fee type combination' },
        { status: 400 }
      )
    }

    // Create fee balance
    const feeBalance = await prisma.feeBalance.create({
      data: {
        studentId: validatedData.studentId,
        academicYearId: validatedData.academicYearId,
        termId: validatedData.termId,
        feeTypeId: validatedData.feeTypeId,
        amountCharged: validatedData.amountCharged,
        amountPaid: validatedData.amountPaid,
        balance: validatedData.balance,
      },
      include: {
        student: {
          include: {
            class: true,
            academicYear: true,
          }
        },
        academicYear: true,
        term: true,
        feeType: true,
      }
    })

    return NextResponse.json({
      message: 'Fee balance created successfully',
      feeBalance
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating fee balance:', error)
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
        { error: 'Fee balance ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateFeeBalanceSchema.parse(body)
    
    // Check if fee balance exists
    const existingBalance = await prisma.feeBalance.findUnique({
      where: { id }
    })
    
    if (!existingBalance) {
      return NextResponse.json(
        { error: 'Fee balance not found' },
        { status: 404 }
      )
    }

    // Update fee balance
    const updatedBalance = await prisma.feeBalance.update({
      where: { id },
      data: {
        amountCharged: validatedData.amountCharged,
        amountPaid: validatedData.amountPaid,
        balance: validatedData.balance,
      },
      include: {
        student: {
          include: {
            class: true,
            academicYear: true,
          }
        },
        academicYear: true,
        term: true,
        feeType: true,
      }
    })

    return NextResponse.json({
      message: 'Fee balance updated successfully',
      feeBalance: updatedBalance
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating fee balance:', error)
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
        { error: 'Fee balance ID is required' },
        { status: 400 }
      )
    }

    // Check if fee balance exists
    const existingBalance = await prisma.feeBalance.findUnique({
      where: { id }
    })
    
    if (!existingBalance) {
      return NextResponse.json(
        { error: 'Fee balance not found' },
        { status: 404 }
      )
    }

    // Delete fee balance
    await prisma.feeBalance.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Fee balance deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting fee balance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



