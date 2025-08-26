import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  admissionNumber: z.string().min(1, "Admission number is required").optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']).optional(),
  classId: z.string().min(1, "Class is required").optional(),
  academicYearId: z.string().min(1, "Academic year is required").optional(),
  branchId: z.string().optional(),
  schoolId: z.string().min(1, "School is required").optional(),
  
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
  status: z.enum(['ACTIVE', 'GRADUATED', 'TRANSFERRED', 'SUSPENDED']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const student = await prisma.student.findUnique({
      where: { id },
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
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        feePayments: {
          include: {
            paymentMethod: true,
            academicYear: true,
            term: true,
            paymentDetails: {
              include: {
                feeType: true
              }
            }
          },
          orderBy: {
            paymentDate: 'desc'
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Calculate fee statistics
    const totalCharged = student.feeBalances.reduce((sum, balance) => 
      sum + parseFloat(balance.amountCharged.toString()), 0
    )
    const totalPaid = student.feeBalances.reduce((sum, balance) => 
      sum + parseFloat(balance.amountPaid.toString()), 0
    )
    const outstandingBalance = totalCharged - totalPaid

    const studentWithStats = {
      ...student,
      feeStatistics: {
        totalCharged,
        totalPaid,
        outstandingBalance,
        lastPaymentDate: student.feePayments[0]?.paymentDate || null
      }
    }

    return NextResponse.json(studentWithStats)

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Validate input
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

    // If admission number is being updated, check for duplicates
    if (validatedData.admissionNumber && 
        validatedData.admissionNumber !== existingStudent.admissionNumber) {
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
      updateData.dateOfBirth = new Date(validatedData.dateOfBirth)
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
          take: 5
        }
      }
    })

    // Calculate updated statistics
    const totalCharged = updatedStudent.feeBalances.reduce((sum, balance) => 
      sum + parseFloat(balance.amountCharged.toString()), 0
    )
    const totalPaid = updatedStudent.feeBalances.reduce((sum, balance) => 
      sum + parseFloat(balance.amountPaid.toString()), 0
    )
    const outstandingBalance = totalCharged - totalPaid

    const studentWithStats = {
      ...updatedStudent,
      feeStatistics: {
        totalCharged,
        totalPaid,
        outstandingBalance,
        lastPaymentDate: updatedStudent.feePayments[0]?.paymentDate || null
      }
    }

    return NextResponse.json({
      message: 'Student updated successfully',
      student: studentWithStats
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // Check if student has any payments (soft delete consideration)
    const hasPayments = await prisma.feePayment.findFirst({
      where: { studentId: id }
    })

    if (hasPayments) {
      // Soft delete - update status to TRANSFERRED
      await prisma.student.update({
        where: { id },
        data: { status: 'TRANSFERRED' }
      })

      return NextResponse.json({
        message: 'Student marked as transferred (soft delete)'
      })
    }

    // Hard delete if no payments exist
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







