import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const academicYearId = searchParams.get('academicYearId')
    const termId = searchParams.get('termId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (studentId) {
      where.studentId = studentId
    }
    
    if (academicYearId) {
      where.academicYearId = academicYearId
    }
    
    if (termId) {
      where.termId = termId
    }

    // Get balances with related data
    const balances = await prisma.feeBalance.findMany({
      where,
      include: {
        student: {
          include: {
            class: true
          }
        },
        academicYear: true,
        term: true,
        feeType: true
      },
      skip,
      take: limit,
      orderBy: [
        { student: { lastName: 'asc' } },
        { student: { firstName: 'asc' } },
        { feeType: { name: 'asc' } }
      ]
    })

    // Get total count for pagination
    const total = await prisma.feeBalance.count({ where })

    // Calculate summary statistics
    const summary = await prisma.feeBalance.aggregate({
      where,
      _sum: {
        amountCharged: true,
        amountPaid: true,
        balance: true
      },
      _count: true
    })

    return NextResponse.json({
      balances,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalCharged: summary._sum.amountCharged || 0,
        totalPaid: summary._sum.amountPaid || 0,
        totalBalance: summary._sum.balance || 0,
        totalRecords: summary._count
      }
    })
  } catch (error) {
    console.error('Error fetching balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { 
      studentId, 
      academicYearId, 
      termId, 
      feeTypeId, 
      amountCharged 
    } = body
    
    if (!studentId || !academicYearId || !feeTypeId || !amountCharged) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if balance already exists for this combination
    const existingBalance = await prisma.feeBalance.findFirst({
      where: {
        studentId,
        academicYearId,
        termId,
        feeTypeId
      }
    })

    if (existingBalance) {
      return NextResponse.json(
        { error: 'Fee balance already exists for this student, term, and fee type' },
        { status: 400 }
      )
    }

    // Validate references
    const [student, academicYear, feeType] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId } }),
      prisma.academicYear.findUnique({ where: { id: academicYearId } }),
      prisma.feeType.findUnique({ where: { id: feeTypeId } })
    ])

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 }
      )
    }

    if (!feeType) {
      return NextResponse.json(
        { error: 'Fee type not found' },
        { status: 404 }
      )
    }

    // Create fee balance
    const balance = await prisma.feeBalance.create({
      data: {
        studentId,
        academicYearId,
        termId,
        feeTypeId,
        amountCharged: parseFloat(amountCharged),
        amountPaid: 0,
        balance: parseFloat(amountCharged)
      },
      include: {
        student: {
          include: {
            class: true
          }
        },
        academicYear: true,
        term: true,
        feeType: true
      }
    })

    return NextResponse.json(balance, { status: 201 })
  } catch (error) {
    console.error('Error creating fee balance:', error)
    return NextResponse.json(
      { error: 'Failed to create fee balance' },
      { status: 500 }
    )
  }
}







