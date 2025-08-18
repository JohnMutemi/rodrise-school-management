import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { school: true }
    })

    if (!user?.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const feeTypeId = searchParams.get('feeTypeId')
    const academicYearId = searchParams.get('academicYearId')

    const where: any = {
      schoolId: user.schoolId
    }

    if (classId) {
      where.classId = classId
    }

    if (feeTypeId) {
      where.feeTypeId = feeTypeId
    }

    if (academicYearId) {
      where.academicYearId = academicYearId
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        class: true,
        feeType: true,
        academicYear: true,
        terms: {
          include: {
            term: true
          }
        }
      },
      orderBy: [
        { academicYear: { name: 'desc' } },
        { class: { name: 'asc' } },
        { feeType: { name: 'asc' } }
      ]
    })

    return NextResponse.json({ feeStructures })

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
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { school: true }
    })

    if (!user?.schoolId) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      classId,
      feeTypeId,
      academicYearId,
      terms
    } = body

    // Validate required fields
    if (!classId || !feeTypeId || !academicYearId || !terms || !Array.isArray(terms)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify class belongs to the school
    const classRecord = await prisma.class.findFirst({
      where: {
        id: classId,
        schoolId: user.schoolId
      }
    })

    if (!classRecord) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // Verify fee type exists
    const feeType = await prisma.feeType.findUnique({
      where: { id: feeTypeId }
    })

    if (!feeType) {
      return NextResponse.json(
        { error: 'Fee type not found' },
        { status: 404 }
      )
    }

    // Verify academic year exists
    const academicYear = await prisma.academicYear.findUnique({
      where: { id: academicYearId }
    })

    if (!academicYear) {
      return NextResponse.json(
        { error: 'Academic year not found' },
        { status: 404 }
      )
    }

    // Check if fee structure already exists for this combination
    const existingStructure = await prisma.feeStructure.findFirst({
      where: {
        schoolId: user.schoolId,
        classId,
        feeTypeId,
        academicYearId
      }
    })

    if (existingStructure) {
      return NextResponse.json(
        { error: 'Fee structure already exists for this class, fee type, and academic year' },
        { status: 409 }
      )
    }

    // Create fee structure with terms
    const feeStructure = await prisma.feeStructure.create({
      data: {
        schoolId: user.schoolId,
        classId,
        feeTypeId,
        academicYearId,
        terms: {
          create: terms.map((term: any) => ({
            termId: term.termId,
            amount: parseFloat(term.amount)
          }))
        }
      },
      include: {
        class: true,
        feeType: true,
        academicYear: true,
        terms: {
          include: {
            term: true
          }
        }
      }
    })

    return NextResponse.json(feeStructure, { status: 201 })

  } catch (error) {
    console.error('Error creating fee structure:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
