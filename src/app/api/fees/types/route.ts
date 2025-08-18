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

    const feeTypes = await prisma.feeType.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ feeTypes })

  } catch (error) {
    console.error('Error fetching fee types:', error)
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
      name,
      description,
      frequency,
      isActive = true
    } = body

    // Validate required fields
    if (!name || !frequency) {
      return NextResponse.json(
        { error: 'Name and frequency are required' },
        { status: 400 }
      )
    }

    // Check if fee type already exists
    const existingFeeType = await prisma.feeType.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    })

    if (existingFeeType) {
      return NextResponse.json(
        { error: 'Fee type with this name already exists' },
        { status: 409 }
      )
    }

    // Create fee type
    const feeType = await prisma.feeType.create({
      data: {
        name,
        description: description || null,
        frequency,
        isActive
      }
    })

    return NextResponse.json(feeType, { status: 201 })

  } catch (error) {
    console.error('Error creating fee type:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
