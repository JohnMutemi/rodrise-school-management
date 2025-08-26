import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const createPaymentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  termId: z.string().optional(),
  paymentDate: z.string().min(1, "Payment date is required"),
  receiptNumber: z.string().min(1, "Receipt number is required"),
  amountPaid: z.number().min(0.01, "Amount paid must be greater than 0"),
  paymentMethodId: z.string().optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  createdBy: z.string().optional(),
  paymentDetails: z.array(z.object({
    feeTypeId: z.string().min(1, "Fee type is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
  })).optional(),
})

const updatePaymentSchema = createPaymentSchema.partial()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const academicYearId = searchParams.get('academicYearId')
    const termId = searchParams.get('termId')
    const paymentMethodId = searchParams.get('paymentMethodId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (studentId) where.studentId = studentId
    if (academicYearId) where.academicYearId = academicYearId
    if (termId) where.termId = termId
    if (paymentMethodId) where.paymentMethodId = paymentMethodId

    // Date range filter
    if (startDate || endDate) {
      where.paymentDate = {}
      if (startDate) where.paymentDate.gte = new Date(startDate)
      if (endDate) where.paymentDate.lte = new Date(endDate)
    }

    // Get payments with related data
    const [payments, total] = await Promise.all([
      prisma.feePayment.findMany({
        where,
        include: {
          student: {
            include: {
              class: true,
              academicYear: true,
            }
          },
          academicYear: true,
          term: true,
          paymentMethod: true,
          paymentDetails: {
            include: {
              feeType: true,
            }
          },
        },
        orderBy: [
          { paymentDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.feePayment.count({ where })
    ])

    // Calculate additional statistics
    const totalAmount = payments.reduce((sum, payment) => 
      sum + parseFloat(payment.amountPaid.toString()), 0
    )

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statistics: {
        totalAmount,
        totalPayments: total
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
    const body = await request.json()
    
    // Validate input
    const validatedData = createPaymentSchema.parse(body)
    
    // Check if receipt number already exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: { receiptNumber: validatedData.receiptNumber }
    })
    
    if (existingPayment) {
      return NextResponse.json(
        { error: 'Receipt number already exists' },
        { status: 400 }
      )
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.feePayment.create({
        data: {
          studentId: validatedData.studentId,
          academicYearId: validatedData.academicYearId,
          termId: validatedData.termId,
          paymentDate: new Date(validatedData.paymentDate),
          receiptNumber: validatedData.receiptNumber,
          amountPaid: validatedData.amountPaid,
          paymentMethodId: validatedData.paymentMethodId,
          referenceNumber: validatedData.referenceNumber,
          notes: validatedData.notes,
          createdBy: validatedData.createdBy,
        },
        include: {
          student: {
            include: {
              class: true,
              academicYear: true,
            }
          },
          academicYear: true,
          term: true,
          paymentMethod: true,
        }
      })

      // Create payment details if provided
      if (validatedData.paymentDetails && validatedData.paymentDetails.length > 0) {
        const paymentDetails = await Promise.all(
          validatedData.paymentDetails.map(detail =>
            tx.paymentDetail.create({
              data: {
                paymentId: payment.id,
                feeTypeId: detail.feeTypeId,
                amount: detail.amount,
              },
              include: {
                feeType: true,
              }
            })
          )
        )
        payment.paymentDetails = paymentDetails
      }

      // Update fee balances
      if (validatedData.paymentDetails) {
        for (const detail of validatedData.paymentDetails) {
          // Find existing fee balance
          const feeBalance = await tx.feeBalance.findFirst({
            where: {
              studentId: validatedData.studentId,
              academicYearId: validatedData.academicYearId,
              termId: validatedData.termId,
              feeTypeId: detail.feeTypeId,
            }
          })

          if (feeBalance) {
            // Update the balance
            const newAmountPaid = parseFloat(feeBalance.amountPaid.toString()) + detail.amount
            const newBalance = parseFloat(feeBalance.amountCharged.toString()) - newAmountPaid

            await tx.feeBalance.update({
              where: { id: feeBalance.id },
              data: {
                amountPaid: newAmountPaid,
                balance: newBalance,
              }
            })
          }
        }
      }

      return payment
    })

    return NextResponse.json({
      message: 'Payment created successfully',
      payment: result
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updatePaymentSchema.parse(body)
    
    // Check if payment exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: { id }
    })
    
    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Check if receipt number already exists for another payment
    if (validatedData.receiptNumber && validatedData.receiptNumber !== existingPayment.receiptNumber) {
      const duplicatePayment = await prisma.feePayment.findUnique({
        where: { receiptNumber: validatedData.receiptNumber }
      })
      
      if (duplicatePayment) {
        return NextResponse.json(
          { error: 'Receipt number already exists' },
          { status: 400 }
        )
      }
    }

    // Update payment
    const updatedPayment = await prisma.feePayment.update({
      where: { id },
      data: {
        paymentDate: validatedData.paymentDate ? new Date(validatedData.paymentDate) : undefined,
        amountPaid: validatedData.amountPaid,
        paymentMethodId: validatedData.paymentMethodId,
        referenceNumber: validatedData.referenceNumber,
        notes: validatedData.notes,
      },
      include: {
        student: {
          include: {
            class: true,
            academicYear: true,
          }
        },
        academicYear: true,
        term: true,
        paymentMethod: true,
        paymentDetails: {
          include: {
            feeType: true,
          }
        },
      }
    })

    return NextResponse.json({
      message: 'Payment updated successfully',
      payment: updatedPayment
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Check if payment exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: { id },
      include: {
        paymentDetails: true,
      }
    })
    
    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Start a transaction to handle payment deletion and balance updates
    await prisma.$transaction(async (tx) => {
      // Delete payment details first
      if (existingPayment.paymentDetails.length > 0) {
        await tx.paymentDetail.deleteMany({
          where: { paymentId: id }
        })
      }

      // Update fee balances (reverse the payment)
      if (existingPayment.paymentDetails.length > 0) {
        for (const detail of existingPayment.paymentDetails) {
          const feeBalance = await tx.feeBalance.findFirst({
            where: {
              studentId: existingPayment.studentId,
              academicYearId: existingPayment.academicYearId,
              termId: existingPayment.termId,
              feeTypeId: detail.feeTypeId,
            }
          })

          if (feeBalance) {
            const newAmountPaid = parseFloat(feeBalance.amountPaid.toString()) - parseFloat(detail.amount.toString())
            const newBalance = parseFloat(feeBalance.amountCharged.toString()) - newAmountPaid

            await tx.feeBalance.update({
              where: { id: feeBalance.id },
              data: {
                amountPaid: newAmountPaid,
                balance: newBalance,
              }
            })
          }
        }
      }

      // Delete the payment
      await tx.feePayment.delete({
        where: { id }
      })
    })

    return NextResponse.json({
      message: 'Payment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}







