import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface StudentImportData {
  admissionNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE'
  className: string
  parentName: string
  parentPhone: string
  parentEmail: string
  address: string
}

interface ImportResult {
  success: boolean
  message: string
  imported: number
  failed: number
  errors: Array<{
    row: number
    admissionNumber: string
    errors: string[]
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { students }: { students: StudentImportData[] } = body

    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of students.' },
        { status: 400 }
      )
    }

    const result: ImportResult = {
      success: true,
      message: 'Import completed successfully',
      imported: 0,
      failed: 0,
      errors: []
    }

    // Get active academic year
    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    })

    if (!activeAcademicYear) {
      return NextResponse.json(
        { error: 'No active academic year found. Please set an active academic year first.' },
        { status: 400 }
      )
    }

    // Get default school (assuming single school for now)
    const school = await prisma.school.findFirst()
    if (!school) {
      return NextResponse.json(
        { error: 'No school found. Please create a school first.' },
        { status: 400 }
      )
    }

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const studentData = students[i]
      const rowNumber = i + 1

      try {
        // Validate required fields
        const validationErrors: string[] = []
        
        if (!studentData.admissionNumber?.trim()) {
          validationErrors.push('Admission number is required')
        }
        if (!studentData.firstName?.trim()) {
          validationErrors.push('First name is required')
        }
        if (!studentData.lastName?.trim()) {
          validationErrors.push('Last name is required')
        }
        if (!studentData.className?.trim()) {
          validationErrors.push('Class is required')
        }
        if (!studentData.parentName?.trim()) {
          validationErrors.push('Parent name is required')
        }
        if (!studentData.parentPhone?.trim()) {
          validationErrors.push('Parent phone is required')
        }
        if (!studentData.parentEmail?.trim()) {
          validationErrors.push('Parent email is required')
        }
        if (!studentData.address?.trim()) {
          validationErrors.push('Address is required')
        }

        // Check if admission number already exists
        const existingStudent = await prisma.student.findUnique({
          where: { admissionNumber: studentData.admissionNumber.trim() }
        })

        if (existingStudent) {
          validationErrors.push('Admission number already exists')
        }

        // Validate email format
        if (studentData.parentEmail && !/\S+@\S+\.\S+/.test(studentData.parentEmail)) {
          validationErrors.push('Invalid email format')
        }

        // Validate date of birth
        if (studentData.dateOfBirth) {
          const date = new Date(studentData.dateOfBirth)
          if (isNaN(date.getTime())) {
            validationErrors.push('Invalid date of birth format')
          }
        }

        // Validate gender
        if (studentData.gender && !['MALE', 'FEMALE'].includes(studentData.gender)) {
          validationErrors.push('Gender must be MALE or FEMALE')
        }

        if (validationErrors.length > 0) {
          result.errors.push({
            row: rowNumber,
            admissionNumber: studentData.admissionNumber || 'N/A',
            errors: validationErrors
          })
          result.failed++
          continue
        }

        // Find or create class
        let classRecord = await prisma.class.findFirst({
          where: { name: studentData.className.trim() }
        })

        if (!classRecord) {
          // Create class if it doesn't exist
          const level = parseInt(studentData.className.match(/\d+/)?.[0] || '1')
          classRecord = await prisma.class.create({
            data: {
              name: studentData.className.trim(),
              level,
              capacity: 40
            }
          })
        }

        // Create student
        await prisma.student.create({
          data: {
            admissionNumber: studentData.admissionNumber.trim(),
            firstName: studentData.firstName.trim(),
            lastName: studentData.lastName.trim(),
            middleName: studentData.middleName?.trim() || null,
            dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
            gender: studentData.gender || 'MALE',
            classId: classRecord.id,
            schoolId: school.id,
            academicYearId: activeAcademicYear.id,
            parentName: studentData.parentName.trim(),
            parentPhone: studentData.parentPhone.trim(),
            parentEmail: studentData.parentEmail.trim(),
            address: studentData.address.trim(),
            status: 'ACTIVE'
          }
        })

        result.imported++

      } catch (error) {
        console.error(`Error importing student at row ${rowNumber}:`, error)
        result.errors.push({
          row: rowNumber,
          admissionNumber: studentData.admissionNumber || 'N/A',
          errors: ['Database error occurred']
        })
        result.failed++
      }
    }

    // Update result message
    if (result.failed > 0) {
      result.success = false
      result.message = `Import completed with ${result.failed} errors. ${result.imported} students imported successfully.`
    } else {
      result.message = `Successfully imported ${result.imported} students.`
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Internal server error during bulk import' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}


