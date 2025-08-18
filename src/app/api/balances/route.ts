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
    const feeTypeId = searchParams.get('feeTypeId')
    const termId = searchParams.get('termId')
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

    if (feeTypeId) {
      where.feeTypeId = feeTypeId
    }

    if (termId) {
      where.termId = termId
    }

    const [balances, total] = await Promise.all([
      prisma.feeBalance.findMany({
        where,
        include: {
          student: {
            include: {
              class: true
            }
          },
          feeType: true,
          term: true
        },
        orderBy: [
          { student: { firstName: 'asc' } },
          { feeType: { name: 'asc' } }
        ],
        skip,
        take: limit
      }),
      prisma.feeBalance.count({ where })
    ])

    // Calculate outstanding amounts
    const balancesWithOutstanding = balances.map(balance => {
      const feeStructure = balance.feeStructure
      const totalAmount = feeStructure ? feeStructure.amount : 0
      const outstandingAmount = totalAmount - balance.amountPaid
      
      return {
        ...balance,
        totalAmount,
        outstandingAmount,
        isFullyPaid: outstandingAmount <= 0,
        isOverdue: outstandingAmount > 0 && balance.dueDate && new Date() > new Date(balance.dueDate)
      }
    })

    return NextResponse.json({
      balances: balancesWithOutstanding,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching fee balances:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
