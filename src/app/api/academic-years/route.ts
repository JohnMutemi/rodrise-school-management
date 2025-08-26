import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch academic years
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId') || 'default'
    const isActive = searchParams.get('isActive')

    // Build where clause
    const where: any = {}
    
    if (isActive === 'true') {
      where.isActive = true
    }

    // Get academic years
    const academicYears = await prisma.academicYear.findMany({
      where,
      orderBy: {
        year: 'desc'
      }
    })

    return NextResponse.json({
      academicYears
    })

  } catch (error) {
    console.error('Error fetching academic years:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new academic year
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.year) {
      return NextResponse.json(
        { error: 'Year is required' },
        { status: 400 }
      )
    }

    // Check if academic year already exists
    const existingYear = await prisma.academicYear.findUnique({
      where: { year: body.year }
    })
    
    if (existingYear) {
      return NextResponse.json(
        { error: 'Academic year already exists' },
        { status: 400 }
      )
    }

    // Create academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        year: body.year,
        isActive: body.isActive ?? false,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
      }
    })

    return NextResponse.json({
      message: 'Academic year created successfully',
      academicYear
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating academic year:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



