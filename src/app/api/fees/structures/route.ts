import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const academicYearId = searchParams.get('academicYearId')

    // Build where clause
    const where: any = { isActive: true }
    
    if (classId) {
      where.classId = classId
    }
    
    if (academicYearId) {
      where.academicYearId = academicYearId
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        class: true,
        academicYear: true,
        feeType: true
      },
      orderBy: [
        { class: { level: 'asc' } },
        { feeType: { name: 'asc' } }
      ]
    })

    return NextResponse.json(feeStructures)
  } catch (error) {
    console.error('Error fetching fee structures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee structures' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { 
      academicYearId, 
      classId, 
      feeTypeId, 
      amount, 
      term1Amount, 
      term2Amount, 
      term3Amount 
    } = body
    
    if (!academicYearId || !classId || !feeTypeId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if fee structure already exists for this combination
    const existingStructure = await prisma.feeStructure.findFirst({
      where: {
        academicYearId,
        classId,
        feeTypeId
      }
    })

    if (existingStructure) {
      return NextResponse.json(
        { error: 'Fee structure already exists for this class, academic year, and fee type' },
        { status: 400 }
      )
    }

    // Validate references
    const [academicYear, classRecord, feeType] = await Promise.all([
      prisma.academicYear.findUnique({ where: { id: academicYearId } }),
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.feeType.findUnique({ where: { id: feeTypeId } })
    ])

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 }
      )
    }

    if (!classRecord) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    if (!feeType) {
      return NextResponse.json(
        { error: 'Fee type not found' },
        { status: 404 }
      )
    }

    // Create fee structure
    const feeStructure = await prisma.feeStructure.create({
      data: {
        academicYearId,
        classId,
        feeTypeId,
        amount: parseFloat(amount),
        term1Amount: parseFloat(term1Amount || 0),
        term2Amount: parseFloat(term2Amount || 0),
        term3Amount: parseFloat(term3Amount || 0),
        isActive: true
      },
      include: {
        class: true,
        academicYear: true,
        feeType: true
      }
    })

    return NextResponse.json(feeStructure, { status: 201 })
  } catch (error) {
    console.error('Error creating fee structure:', error)
    return NextResponse.json(
      { error: 'Failed to create fee structure' },
      { status: 500 }
    )
  }
}







