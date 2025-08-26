import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Student import schema
const studentImportSchema = z.object({
  students: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    studentId: z.string().min(1, 'Student ID is required'),
    email: z.string().email('Invalid email format').optional(),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().optional(),
    parentName: z.string().optional(),
    parentPhone: z.string().optional(),
    parentEmail: z.string().email('Invalid parent email format').optional(),
    classId: z.string().min(1, 'Class ID is required'),
    academicYearId: z.string().min(1, 'Academic year ID is required'),
    enrollmentDate: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED', 'TRANSFERRED']).default('ACTIVE'),
    schoolId: z.string().min(1, 'School ID is required'),
  })),
  schoolId: z.string().min(1, 'School ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { students, schoolId } = studentImportSchema.parse(body);

    // Validate that all required entities exist
    const classIds = [...new Set(students.map(s => s.classId))];
    const academicYearIds = [...new Set(students.map(s => s.academicYearId))];

    const [classes, academicYears] = await Promise.all([
      prisma.class.findMany({
        where: {
          id: { in: classIds },
          schoolId: schoolId,
        },
        select: { id: true, name: true },
      }),
      prisma.academicYear.findMany({
        where: {
          id: { in: academicYearIds },
          schoolId: schoolId,
        },
        select: { id: true, year: true },
      }),
    ]);

    const validClassIds = new Set(classes.map(c => c.id));
    const validAcademicYearIds = new Set(academicYears.map(ay => ay.id));

    // Validate student data
    const validationErrors: Array<{ row: number; field: string; message: string }> = [];
    
    students.forEach((student, index) => {
      if (!validClassIds.has(student.classId)) {
        validationErrors.push({
          row: index + 1,
          field: 'classId',
          message: `Class with ID ${student.classId} not found`,
        });
      }
      
      if (!validAcademicYearIds.has(student.academicYearId)) {
        validationErrors.push({
          row: index + 1,
          field: 'academicYearId',
          message: `Academic year with ID ${student.academicYearId} not found`,
        });
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation errors found',
          validationErrors 
        },
        { status: 400 }
      );
    }

    // Check for duplicate student IDs
    const existingStudentIds = await prisma.student.findMany({
      where: {
        studentId: { in: students.map(s => s.studentId) },
        schoolId: schoolId,
      },
      select: { studentId: true },
    });

    const existingIds = new Set(existingStudentIds.map(s => s.studentId));
    const duplicateIds = students
      .map((student, index) => ({ student, index }))
      .filter(({ student }) => existingIds.has(student.studentId));

    if (duplicateIds.length > 0) {
      return NextResponse.json(
        {
          error: 'Duplicate student IDs found',
          duplicates: duplicateIds.map(({ student, index }) => ({
            row: index + 1,
            studentId: student.studentId,
          })),
        },
        { status: 400 }
      );
    }

    // Import students in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const importedStudents = [];
      const errors = [];

      for (let i = 0; i < students.length; i++) {
        try {
          const studentData = students[i];
          
          const student = await tx.student.create({
            data: {
              firstName: studentData.firstName,
              lastName: studentData.lastName,
              studentId: studentData.studentId,
              email: studentData.email,
              phone: studentData.phone,
              dateOfBirth: studentData.dateOfBirth ? new Date(studentData.dateOfBirth) : null,
              gender: studentData.gender,
              address: studentData.address,
              parentName: studentData.parentName,
              parentPhone: studentData.parentPhone,
              parentEmail: studentData.parentEmail,
              enrollmentDate: studentData.enrollmentDate ? new Date(studentData.enrollmentDate) : new Date(),
              status: studentData.status,
              schoolId: studentData.schoolId,
              classId: studentData.classId,
              academicYearId: studentData.academicYearId,
            },
            include: {
              class: true,
              academicYear: true,
            },
          });

          importedStudents.push(student);
        } catch (error) {
          errors.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return { importedStudents, errors };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.importedStudents.length} students`,
      importedCount: result.importedStudents.length,
      errorCount: result.errors.length,
      errors: result.errors,
      students: result.importedStudents.map(student => ({
        id: student.id,
        studentId: student.studentId,
        name: `${student.firstName} ${student.lastName}`,
        class: student.class.name,
        academicYear: student.academicYear.year,
      })),
    });

  } catch (error) {
    console.error('Student import error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid data format',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to import students' },
      { status: 500 }
    );
  }
}

// GET endpoint to download import template
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Get available classes and academic years for the template
    const [classes, academicYears] = await Promise.all([
      prisma.class.findMany({
        where: { schoolId },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.academicYear.findMany({
        where: { schoolId },
        select: { id: true, year: true },
        orderBy: { year: 'desc' },
      }),
    ]);

    // Create CSV template
    const csvHeaders = [
      'firstName',
      'lastName', 
      'studentId',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'address',
      'parentName',
      'parentPhone',
      'parentEmail',
      'classId',
      'academicYearId',
      'enrollmentDate',
      'status'
    ];

    const csvContent = [
      csvHeaders.join(','),
      // Example row
      'John,Doe,STU001,john.doe@email.com,+2348012345678,2005-01-15,MALE,123 Main St,John Doe Sr,+2348012345679,john.sr@email.com,' + 
      (classes[0]?.id || 'CLASS_ID') + ',' + 
      (academicYears[0]?.id || 'ACADEMIC_YEAR_ID') + ',2024-09-01,ACTIVE'
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="students-import-template.csv"',
      },
    });

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate import template' },
      { status: 500 }
    );
  }
}




















