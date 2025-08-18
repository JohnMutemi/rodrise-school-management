import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/students/[id] - Get specific student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.student.findFirst({
      where: {
        id: params.id,
        schoolId: session.user?.schoolId || '1'
      },
      include: {
        class: true,
        school: true,
        feePayments: {
          include: {
            paymentMethod: true,
            feeType: true,
          },
          orderBy: { paymentDate: 'desc' }
        },
        feeBalances: {
          include: {
            feeType: true,
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/students/[id] - Update student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      parentName,
      parentPhone,
      parentEmail,
      classId,
      status
    } = body

    // Check if student exists and belongs to the school
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: params.id,
        schoolId: session.user?.schoolId || '1'
      }
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if email is being changed and if it conflicts with another student
    if (email && email !== existingStudent.email) {
      const emailConflict = await prisma.student.findFirst({
        where: {
          email,
          schoolId: session.user?.schoolId || '1',
          id: { not: params.id }
        }
      })

      if (emailConflict) {
        return NextResponse.json(
          { error: 'Student with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Update student
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        parentName,
        parentPhone,
        parentEmail,
        classId,
        status,
        updatedAt: new Date()
      },
      include: {
        class: true,
        school: true,
      }
    })

    return NextResponse.json(updatedStudent)

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/students/[id] - Delete student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if student exists and belongs to the school
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: params.id,
        schoolId: session.user?.schoolId || '1'
      }
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if student has any related records (payments, balances, etc.)
    const hasRelatedRecords = await prisma.feePayment.findFirst({
      where: { studentId: params.id }
    })

    if (hasRelatedRecords) {
      // Soft delete - just mark as inactive
      await prisma.student.update({
        where: { id: params.id },
        data: { 
          status: 'inactive',
          updatedAt: new Date()
        }
      })
    } else {
      // Hard delete if no related records
      await prisma.student.delete({
        where: { id: params.id }
      })
    }

    return NextResponse.json({ message: 'Student deleted successfully' })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
