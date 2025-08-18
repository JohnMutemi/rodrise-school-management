import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Get students with related data
    const students = await prisma.student.findMany({
      where,
      include: {
        class: true,
        school: true,
        branch: true,
        academicYear: true,
        feeBalances: {
          include: {
            feeType: true
          }
        },
        feePayments: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Get total count for pagination
    const total = await prisma.student.count({ where })

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { admissionNumber, firstName, lastName, classId, schoolId, academicYearId } = body
    
    if (!admissionNumber || !firstName || !lastName || !classId || !schoolId || !academicYearId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if admission number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNumber }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Admission number already exists' },
        { status: 400 }
      )
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        admissionNumber,
        firstName,
        lastName,
        middleName: body.middleName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        schoolId,
        classId,
        branchId: body.branchId,
        academicYearId,
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        parentEmail: body.parentEmail,
        address: body.address,
        status: body.status || 'ACTIVE'
      },
      include: {
        class: true,
        school: true,
        branch: true,
        academicYear: true
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}







