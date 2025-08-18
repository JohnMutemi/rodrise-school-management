import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' }
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, level, capacity } = body
    
    if (!name || !level) {
      return NextResponse.json(
        { error: 'Name and level are required' },
        { status: 400 }
      )
    }

    // Check if class already exists
    const existingClass = await prisma.class.findFirst({
      where: { 
        name: { equals: name, mode: 'insensitive' },
        level: parseInt(level)
      }
    })

    if (existingClass) {
      return NextResponse.json(
        { error: 'Class with this name and level already exists' },
        { status: 400 }
      )
    }

    // Create class
    const classRecord = await prisma.class.create({
      data: {
        name,
        level: parseInt(level),
        capacity: parseInt(capacity || 40),
        isActive: true
      }
    })

    return NextResponse.json(classRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    )
  }
}


