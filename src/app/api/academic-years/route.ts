import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: { year: 'desc' }
    })

    return NextResponse.json(academicYears)
  } catch (error) {
    console.error('Error fetching academic years:', error)
    return NextResponse.json(
      { error: 'Failed to fetch academic years' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { year, startDate, endDate, isActive } = body
    
    if (!year || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Year, start date, and end date are required' },
        { status: 400 }
      )
    }

    // Check if academic year already exists
    const existingYear = await prisma.academicYear.findUnique({
      where: { year }
    })

    if (existingYear) {
      return NextResponse.json(
        { error: 'Academic year already exists' },
        { status: 400 }
      )
    }

    // If this is set as active, deactivate other years
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })
    }

    // Create academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        year,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: isActive || false
      }
    })

    return NextResponse.json(academicYear, { status: 201 })
  } catch (error) {
    console.error('Error creating academic year:', error)
    return NextResponse.json(
      { error: 'Failed to create academic year' },
      { status: 500 }
    )
  }
}


