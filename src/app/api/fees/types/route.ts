import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const feeTypes = await prisma.feeType.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(feeTypes)
  } catch (error) {
    console.error('Error fetching fee types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, description, isMandatory, isRecurring, frequency } = body
    
    if (!name) {
      return NextResponse.json(
        { error: 'Fee type name is required' },
        { status: 400 }
      )
    }

    // Check if fee type already exists
    const existingFeeType = await prisma.feeType.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingFeeType) {
      return NextResponse.json(
        { error: 'Fee type with this name already exists' },
        { status: 400 }
      )
    }

    // Create fee type
    const feeType = await prisma.feeType.create({
      data: {
        name,
        description,
        isMandatory: isMandatory ?? true,
        isRecurring: isRecurring ?? true,
        frequency: frequency || 'TERM'
      }
    })

    return NextResponse.json(feeType, { status: 201 })
  } catch (error) {
    console.error('Error creating fee type:', error)
    return NextResponse.json(
      { error: 'Failed to create fee type' },
      { status: 500 }
    )
  }
}







