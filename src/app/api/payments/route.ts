import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (studentId) {
      where.studentId = studentId
    }

    // Get payments with related data
    const payments = await prisma.feePayment.findMany({
      where,
      include: {
        student: {
          include: {
            class: true
          }
        },
        academicYear: true,
        term: true,
        paymentMethod: true,
        paymentDetails: {
          include: {
            feeType: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { paymentDate: 'desc' }
    })

    // Get total count for pagination
    const total = await prisma.feePayment.count({ where })

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
      { error: 'Failed to fetch payments' },
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
      paymentDate, 
      receiptNumber, 
      amountPaid, 
      paymentMethodId,
      paymentDetails 
    } = body
    
    if (!studentId || !academicYearId || !paymentDate || !receiptNumber || !amountPaid || !paymentDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if receipt number already exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: { receiptNumber }
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Receipt number already exists' },
        { status: 400 }
      )
    }

    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Create payment with transaction
    const payment = await prisma.$transaction(async (tx) => {
      // Create the payment
      const newPayment = await tx.feePayment.create({
        data: {
          studentId,
          academicYearId,
          termId,
          paymentDate: new Date(paymentDate),
          receiptNumber,
          amountPaid: parseFloat(amountPaid),
          paymentMethodId,
          referenceNumber: body.referenceNumber,
          notes: body.notes,
          createdBy: body.createdBy || 'system'
        }
      })

      // Create payment details
      for (const detail of paymentDetails) {
        await tx.paymentDetail.create({
          data: {
            paymentId: newPayment.id,
            feeTypeId: detail.feeTypeId,
            amount: parseFloat(detail.amount)
          }
        })
      }

      // Update fee balances
      for (const detail of paymentDetails) {
        const existingBalance = await tx.feeBalance.findFirst({
          where: {
            studentId,
            academicYearId,
            termId,
            feeTypeId: detail.feeTypeId
          }
        })

        if (existingBalance) {
          await tx.feeBalance.update({
            where: { id: existingBalance.id },
            data: {
              amountPaid: {
                increment: parseFloat(detail.amount)
              },
              balance: {
                decrement: parseFloat(detail.amount)
              }
            }
          })
        }
      }

      return newPayment
    })

    // Return the created payment with details
    const paymentWithDetails = await prisma.feePayment.findUnique({
      where: { id: payment.id },
      include: {
        student: {
          include: {
            class: true
          }
        },
        academicYear: true,
        term: true,
        paymentMethod: true,
        paymentDetails: {
          include: {
            feeType: true
          }
        }
      }
    })

    return NextResponse.json(paymentWithDetails, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}







