import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        school: true,
        branch: true,
        academicYear: true,
        feeBalances: {
          include: {
            feeType: true,
            term: true
          }
        },
        feePayments: {
          include: {
            paymentMethod: true,
            term: true,
            paymentDetails: {
              include: {
                feeType: true
              }
            }
          },
          orderBy: { paymentDate: 'desc' }
        },
        otherCharges: true
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await request.json()
    
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

    // Check if admission number is being changed and if it already exists
    if (body.admissionNumber && body.admissionNumber !== existingStudent.admissionNumber) {
      const duplicateStudent = await prisma.student.findUnique({
        where: { admissionNumber: body.admissionNumber }
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
        admissionNumber: body.admissionNumber,
        firstName: body.firstName,
        lastName: body.lastName,
        middleName: body.middleName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        schoolId: body.schoolId,
        classId: body.classId,
        branchId: body.branchId,
        academicYearId: body.academicYearId,
        parentName: body.parentName,
        parentPhone: body.parentPhone,
        parentEmail: body.parentEmail,
        address: body.address,
        status: body.status,
        graduationDate: body.graduationDate ? new Date(body.graduationDate) : null
      },
      include: {
        class: true,
        school: true,
        branch: true,
        academicYear: true
      }
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
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

    // Check if student has any payments or balances
    const hasPayments = await prisma.feePayment.findFirst({
      where: { studentId: id }
    })

    const hasBalances = await prisma.feeBalance.findFirst({
      where: { studentId: id }
    })

    if (hasPayments || hasBalances) {
      return NextResponse.json(
        { error: 'Cannot delete student with existing payments or balances' },
        { status: 400 }
      )
    }

    // Delete student
    await prisma.student.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}







