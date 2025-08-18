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
    const studentId = searchParams.get('studentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {
      student: {
        schoolId: user.schoolId
      }
    }

    if (studentId) {
      where.studentId = studentId
    }

    const [payments, total] = await Promise.all([
      prisma.feePayment.findMany({
        where,
        include: {
          student: {
            include: {
              class: true
            }
          },
          feeType: true,
          paymentMethod: true,
          paymentDetails: true
        },
        orderBy: {
          paymentDate: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.feePayment.count({ where })
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
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
      studentId,
      feeTypeId,
      termId,
      amount,
      paymentMethodId,
      referenceNumber,
      notes,
      paymentDate
    } = body

    // Validate required fields
    if (!studentId || !feeTypeId || !termId || !amount || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify student belongs to the school
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: user.schoolId
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
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

    // Verify payment method exists
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId }
    })

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Create payment
    const payment = await prisma.feePayment.create({
      data: {
        studentId,
        feeTypeId,
        termId,
        amount: parseFloat(amount),
        paymentMethodId,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        recordedBy: user.id
      },
      include: {
        student: {
          include: {
            class: true
          }
        },
        feeType: true,
        paymentMethod: true,
        paymentDetails: true
      }
    })

    // Update fee balance
    await prisma.feeBalance.upsert({
      where: {
        studentId_feeTypeId_termId: {
          studentId,
          feeTypeId,
          termId
        }
      },
      update: {
        amountPaid: {
          increment: parseFloat(amount)
        },
        lastPaymentDate: new Date()
      },
      create: {
        studentId,
        feeTypeId,
        termId,
        amountPaid: parseFloat(amount),
        lastPaymentDate: new Date()
      }
    })

    return NextResponse.json(payment, { status: 201 })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
