import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  admissionNumber: z.string().min(1, "Admission number is required"),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  classId: z.string().min(1, "Class is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  branchId: z.string().optional(),
  schoolId: z.string().min(1, "School is required"),
  
  // Parent Information
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z.string().email().optional(),
  address: z.string().optional(),
  
  // Additional Information
  middleName: z.string().optional(),
  previousSchool: z.string().optional(),
  medicalConditions: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  
  // Status
  status: z.enum(['ACTIVE', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED']).optional(),
})

const updateStudentSchema = createStudentSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId') || 'default'
    const classId = searchParams.get('classId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      schoolId,
    }

    if (classId) where.classId = classId
    if (status && status !== 'all') {
      // Convert status to uppercase to match enum values
      const statusValue = status.toUpperCase()
      if (['ACTIVE', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED'].includes(statusValue)) {
        where.status = statusValue
      }
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { admissionNumber: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get students with related data
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: true,
          academicYear: true,
          branch: true,
          school: true,
          feeBalances: {
            include: {
              feeType: true,
              academicYear: true,
              term: true,
            }
          },
          feePayments: {
            include: {
              paymentMethod: true,
              academicYear: true,
              term: true,
            },
            orderBy: {
              paymentDate: 'desc'
            },
            take: 5 // Get last 5 payments
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.student.count({ where })
    ])

    // Calculate statistics for each student
    const studentsWithStats = students.map(student => {
      const totalCharged = student.feeBalances.reduce((sum, balance) => 
        sum + parseFloat(balance.amountCharged.toString()), 0
      )
      const totalPaid = student.feeBalances.reduce((sum, balance) => 
        sum + parseFloat(balance.amountPaid.toString()), 0
      )
      const outstandingBalance = totalCharged - totalPaid

      return {
        ...student,
        feeStatistics: {
          totalCharged,
          totalPaid,
          outstandingBalance,
          lastPaymentDate: student.feePayments[0]?.paymentDate || null
        }
      }
    })

    return NextResponse.json({
      students: studentsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching students:', error)
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
    const validatedData = createStudentSchema.parse(body)
    
    // Check if admission number already exists
    const existingStudent = await prisma.student.findUnique({
      where: { admissionNumber: validatedData.admissionNumber }
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
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        admissionNumber: validatedData.admissionNumber,
        middleName: validatedData.middleName,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth + 'T00:00:00.000Z') : null,
        gender: validatedData.gender,
        classId: validatedData.classId,
        academicYearId: validatedData.academicYearId,
        branchId: validatedData.branchId,
        schoolId: validatedData.schoolId,
        parentName: validatedData.parentName,
        parentPhone: validatedData.parentPhone,
        parentEmail: validatedData.parentEmail,
        address: validatedData.address,
        previousSchool: validatedData.previousSchool,
        medicalConditions: validatedData.medicalConditions,
        emergencyContact: validatedData.emergencyContact,
        allergies: validatedData.allergies,
        status: validatedData.status,
        enrollmentDate: new Date(),
      },
      include: {
        class: true,
        academicYear: true,
        branch: true,
        school: true,
      }
    })

    // Get fee structures for the student's class and academic year
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        classId: student.classId!,
        academicYearId: student.academicYearId!,
        isActive: true
      }
    })

    // Create initial fee balances
    const feeBalancePromises = feeStructures.map(feeStructure => 
      prisma.feeBalance.create({
        data: {
          studentId: student.id,
          academicYearId: student.academicYearId!,
          feeTypeId: feeStructure.feeTypeId,
          amountCharged: feeStructure.amount,
          amountPaid: 0,
          balance: feeStructure.amount,
        }
      })
    )

    await Promise.all(feeBalancePromises)

    return NextResponse.json({
      message: 'Student registered successfully',
      student
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update student (full update)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createStudentSchema.parse(body)
    
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    })
    
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if admission number already exists for another student
    if (validatedData.admissionNumber !== existingStudent.admissionNumber) {
      const duplicateStudent = await prisma.student.findUnique({
        where: { admissionNumber: validatedData.admissionNumber }
      })
      
      if (duplicateStudent) {
        return NextResponse.json(
          { error: 'Admission number already exists' },
          { status: 400 }
        )
      }
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth + 'T00:00:00.000Z') : null,
      },
      include: {
        class: true,
        academicYear: true,
        branch: true,
        school: true,
      }
    })

    return NextResponse.json({
      message: 'Student updated successfully',
      student: updatedStudent
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Partial update student
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input (partial)
    const validatedData = updateStudentSchema.parse(body)
    
    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id }
    })
    
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if admission number already exists for another student
    if (validatedData.admissionNumber && validatedData.admissionNumber !== existingStudent.admissionNumber) {
      const duplicateStudent = await prisma.student.findUnique({
        where: { admissionNumber: validatedData.admissionNumber }
      })
      
      if (duplicateStudent) {
        return NextResponse.json(
          { error: 'Admission number already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = { ...validatedData }
    if (validatedData.dateOfBirth) {
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth + 'T00:00:00.000Z')
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        academicYear: true,
        branch: true,
        school: true,
      }
    })

    return NextResponse.json({
      message: 'Student updated successfully',
      student: updatedStudent
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete student
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        feePayments: true,
        feeBalances: true,
      }
    })
    
    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if student has any payments (soft delete consideration)
    if (existingStudent.feePayments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete student with existing payments. Consider deactivating instead.' },
        { status: 400 }
      )
    }

    // Delete related records first
    await prisma.feeBalance.deleteMany({
      where: { studentId: id }
    })

    // Delete student
    await prisma.student.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Student deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}