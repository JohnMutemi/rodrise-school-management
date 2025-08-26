import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'financial'
    const academicYearId = searchParams.get('academicYearId')
    const classId = searchParams.get('classId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const schoolId = searchParams.get('schoolId')

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required for reports' },
        { status: 400 }
      )
    }

    let reportData: any = {}

    switch (reportType) {
      case 'financial':
        reportData = await generateFinancialReport(academicYearId, classId, startDate, endDate, schoolId)
        break
      case 'student':
        reportData = await generateStudentReport(academicYearId, classId, schoolId)
        break
      case 'payment':
        reportData = await generatePaymentReport(startDate, endDate, schoolId)
        break
      case 'balance':
        reportData = await generateBalanceReport(academicYearId, classId, schoolId)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      reportType,
      generatedAt: new Date().toISOString(),
      ...reportData
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function generateFinancialReport(academicYearId?: string, classId?: string, startDate?: string, endDate?: string, schoolId?: string) {
  const where: any = {}
  
  if (academicYearId) where.academicYearId = academicYearId
  if (classId) where.student = { classId }
  if (startDate || endDate) {
    where.paymentDate = {}
    if (startDate) where.paymentDate.gte = new Date(startDate)
    if (endDate) where.paymentDate.lte = new Date(endDate)
  }
  if (schoolId) where.student = { ...where.student, schoolId }

  const [payments, feeBalances, students] = await Promise.all([
    prisma.feePayment.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
            academicYear: true
          }
        },
        paymentMethod: true
      }
    }),
    prisma.feeBalance.findMany({
      where: {
        student: {
          schoolId,
          ...(classId && { classId }),
          ...(academicYearId && { academicYearId })
        }
      },
      include: {
        student: {
          include: {
            class: true,
            academicYear: true
          }
        },
        feeType: true
      }
    }),
    prisma.student.count({
      where: {
        schoolId,
        ...(classId && { classId }),
        ...(academicYearId && { academicYearId })
      }
    })
  ])

  const totalPayments = payments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0)
  const totalCharged = feeBalances.reduce((sum, balance) => sum + parseFloat(balance.amountCharged.toString()), 0)
  const totalOutstanding = feeBalances.reduce((sum, balance) => sum + parseFloat(balance.balance.toString()), 0)

  const paymentsByMethod = payments.reduce((acc, payment) => {
    const method = payment.paymentMethod?.name || 'Unknown'
    acc[method] = (acc[method] || 0) + parseFloat(payment.amountPaid.toString())
    return acc
  }, {} as Record<string, number>)

  const paymentsByMonth = payments.reduce((acc, payment) => {
    const month = new Date(payment.paymentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    acc[month] = (acc[month] || 0) + parseFloat(payment.amountPaid.toString())
    return acc
  }, {} as Record<string, number>)

  return {
    summary: {
      totalStudents: students,
      totalCharged,
      totalPayments,
      totalOutstanding,
      collectionRate: totalCharged > 0 ? ((totalPayments / totalCharged) * 100).toFixed(2) : '0'
    },
    paymentsByMethod,
    paymentsByMonth,
    recentPayments: payments.slice(0, 10).map(payment => ({
      id: payment.id,
      studentName: `${payment.student?.firstName} ${payment.student?.lastName}`,
      amount: parseFloat(payment.amountPaid.toString()),
      paymentMethod: payment.paymentMethod?.name,
      paymentDate: payment.paymentDate,
      receiptNumber: payment.receiptNumber
    }))
  }
}

async function generateStudentReport(academicYearId?: string, classId?: string, schoolId?: string) {
  const where: any = { schoolId }
  
  if (academicYearId) where.academicYearId = academicYearId
  if (classId) where.classId = classId

  const students = await prisma.student.findMany({
    where,
    include: {
      class: true,
      academicYear: true,
      feeBalances: {
        include: {
          feeType: true
        }
      },
      feePayments: true
    }
  })

  const studentsByClass = students.reduce((acc, student) => {
    const className = student.class?.name || 'Unknown'
    acc[className] = (acc[className] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const studentsByStatus = students.reduce((acc, student) => {
    const totalCharged = student.feeBalances.reduce((sum, balance) => sum + parseFloat(balance.amountCharged.toString()), 0)
    const totalPaid = student.feePayments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0)
    
    let status = 'UNPAID'
    if (totalPaid >= totalCharged) status = 'PAID'
    else if (totalPaid > 0) status = 'PARTIAL'
    
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalStudents: students.length,
    studentsByClass,
    studentsByStatus,
    students: students.map(student => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      class: student.class?.name,
      academicYear: student.academicYear?.year,
      totalCharged: student.feeBalances.reduce((sum, balance) => sum + parseFloat(balance.amountCharged.toString()), 0),
      totalPaid: student.feePayments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0),
      outstandingBalance: student.feeBalances.reduce((sum, balance) => sum + parseFloat(balance.balance.toString()), 0)
    }))
  }
}

async function generatePaymentReport(startDate?: string, endDate?: string, schoolId?: string) {
  const where: any = {
    student: { schoolId }
  }
  
  if (startDate || endDate) {
    where.paymentDate = {}
    if (startDate) where.paymentDate.gte = new Date(startDate)
    if (endDate) where.paymentDate.lte = new Date(endDate)
  }

  const payments = await prisma.feePayment.findMany({
    where,
    include: {
      student: {
        include: {
          class: true,
          academicYear: true
        }
      },
      paymentMethod: true,
      paymentDetails: {
        include: {
          feeType: true
        }
      }
    },
    orderBy: {
      paymentDate: 'desc'
    }
  })

  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amountPaid.toString()), 0)
  const totalCount = payments.length

  const paymentsByFeeType = payments.reduce((acc, payment) => {
    payment.paymentDetails.forEach(detail => {
      const feeType = detail.feeType?.name || 'Unknown'
      acc[feeType] = (acc[feeType] || 0) + parseFloat(detail.amount.toString())
    })
    return acc
  }, {} as Record<string, number>)

  return {
    summary: {
      totalPayments: totalCount,
      totalAmount,
      averagePayment: totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : '0'
    },
    paymentsByFeeType,
    payments: payments.map(payment => ({
      id: payment.id,
      receiptNumber: payment.receiptNumber,
      studentName: `${payment.student?.firstName} ${payment.student?.lastName}`,
      amount: parseFloat(payment.amountPaid.toString()),
      paymentMethod: payment.paymentMethod?.name,
      paymentDate: payment.paymentDate,
      feeTypes: payment.paymentDetails.map(detail => detail.feeType?.name).join(', ')
    }))
  }
}

async function generateBalanceReport(academicYearId?: string, classId?: string, schoolId?: string) {
  const where: any = {
    student: { schoolId }
  }
  
  if (academicYearId) where.academicYearId = academicYearId
  if (classId) where.student = { ...where.student, classId }

  const balances = await prisma.feeBalance.findMany({
    where,
    include: {
      student: {
        include: {
          class: true,
          academicYear: true
        }
      },
      feeType: true
    }
  })

  const totalCharged = balances.reduce((sum, balance) => sum + parseFloat(balance.amountCharged.toString()), 0)
  const totalPaid = balances.reduce((sum, balance) => sum + parseFloat(balance.amountPaid.toString()), 0)
  const totalOutstanding = balances.reduce((sum, balance) => sum + parseFloat(balance.balance.toString()), 0)

  const balancesByFeeType = balances.reduce((acc, balance) => {
    const feeType = balance.feeType?.name || 'Unknown'
    if (!acc[feeType]) {
      acc[feeType] = { charged: 0, paid: 0, outstanding: 0 }
    }
    acc[feeType].charged += parseFloat(balance.amountCharged.toString())
    acc[feeType].paid += parseFloat(balance.amountPaid.toString())
    acc[feeType].outstanding += parseFloat(balance.balance.toString())
    return acc
  }, {} as Record<string, { charged: number; paid: number; outstanding: number }>)

  const overdueBalances = balances.filter(balance => {
    const balanceAmount = parseFloat(balance.balance.toString())
    return balanceAmount > 0 && balance.dueDate && new Date() > new Date(balance.dueDate)
  })

  return {
    summary: {
      totalCharged,
      totalPaid,
      totalOutstanding,
      overdueAmount: overdueBalances.reduce((sum, balance) => sum + parseFloat(balance.balance.toString()), 0),
      overdueCount: overdueBalances.length
    },
    balancesByFeeType,
    overdueBalances: overdueBalances.map(balance => ({
      id: balance.id,
      studentName: `${balance.student?.firstName} ${balance.student?.lastName}`,
      feeType: balance.feeType?.name,
      outstandingAmount: parseFloat(balance.balance.toString()),
      dueDate: balance.dueDate
    }))
  }
}






















