import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const exportSchema = z.object({
  type: z.enum(['students', 'payments', 'fee-balances', 'fee-structures', 'all']),
  format: z.enum(['csv', 'json']).default('csv'),
  filters: z.object({
    schoolId: z.string().optional(),
    classId: z.string().optional(),
    academicYearId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, format, filters } = exportSchema.parse(body);

    const schoolId = filters?.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'students':
        data = await exportStudents(schoolId, filters);
        filename = 'students-export';
        break;
      case 'payments':
        data = await exportPayments(schoolId, filters);
        filename = 'payments-export';
        break;
      case 'fee-balances':
        data = await exportFeeBalances(schoolId, filters);
        filename = 'fee-balances-export';
        break;
      case 'fee-structures':
        data = await exportFeeStructures(schoolId, filters);
        filename = 'fee-structures-export';
        break;
      case 'all':
        const [students, payments, feeBalances, feeStructures] = await Promise.all([
          exportStudents(schoolId, filters),
          exportPayments(schoolId, filters),
          exportFeeBalances(schoolId, filters),
          exportFeeStructures(schoolId, filters),
        ]);
        data = {
          students,
          payments,
          feeBalances,
          feeStructures,
        };
        filename = 'complete-export';
        break;
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data,
        filename: `${filename}.json`,
        recordCount: Array.isArray(data) ? data.length : Object.keys(data).length,
      });
    }

    // Convert to CSV
    const csvContent = convertToCSV(data, type);
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid export parameters',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

async function exportStudents(schoolId: string, filters?: any) {
  const where: any = { schoolId };

  if (filters?.classId) where.classId = filters.classId;
  if (filters?.academicYearId) where.academicYearId = filters.academicYearId;
  if (filters?.status) where.status = filters.status;

  const students = await prisma.student.findMany({
    where,
    include: {
      class: true,
      academicYear: true,
    },
    orderBy: { lastName: 'asc' },
  });

  return students.map(student => ({
    'Student ID': student.studentId,
    'First Name': student.firstName,
    'Last Name': student.lastName,
    'Email': student.email || '',
    'Phone': student.phone || '',
    'Date of Birth': student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : '',
    'Gender': student.gender || '',
    'Address': student.address || '',
    'Parent Name': student.parentName || '',
    'Parent Phone': student.parentPhone || '',
    'Parent Email': student.parentEmail || '',
    'Class': student.class?.name || '',
    'Academic Year': student.academicYear?.year || '',
    'Enrollment Date': student.enrollmentDate ? student.enrollmentDate.toISOString().split('T')[0] : '',
    'Status': student.status,
    'Created At': student.createdAt.toISOString(),
  }));
}

async function exportPayments(schoolId: string, filters?: any) {
  const where: any = { school: { schoolId } };

  if (filters?.startDate) {
    where.createdAt = { gte: new Date(filters.startDate) };
  }
  if (filters?.endDate) {
    where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
  }

  const payments = await prisma.feePayment.findMany({
    where,
    include: {
      student: {
        include: {
          class: true,
          academicYear: true,
        }
      },
      paymentDetails: {
        include: {
          feeBalance: {
            include: {
              feeStructure: {
                include: {
                  feeType: true,
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return payments.map(payment => ({
    'Receipt Number': payment.receiptNumber,
    'Student ID': payment.student?.studentId || '',
    'Student Name': `${payment.student?.firstName || ''} ${payment.student?.lastName || ''}`,
    'Class': payment.student?.class?.name || '',
    'Academic Year': payment.student?.academicYear?.year || '',
    'Amount': payment.amount,
    'Payment Method': payment.paymentMethod,
    'Payment Date': payment.createdAt.toISOString().split('T')[0],
    'Fee Types': payment.paymentDetails?.map(d => d.feeBalance?.feeStructure?.feeType?.name).join(', ') || '',
    'Status': payment.status,
  }));
}

async function exportFeeBalances(schoolId: string, filters?: any) {
  const where: any = { student: { schoolId } };

  if (filters?.classId) where.student = { ...where.student, classId: filters.classId };
  if (filters?.academicYearId) where.student = { ...where.student, academicYearId: filters.academicYearId };
  if (filters?.status) where.status = filters.status;

  const feeBalances = await prisma.feeBalance.findMany({
    where,
    include: {
      student: {
        include: {
          class: true,
          academicYear: true,
        }
      },
      feeStructure: {
        include: {
          feeType: true,
          class: true,
          academicYear: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return feeBalances.map(balance => ({
    'Student ID': balance.student?.studentId || '',
    'Student Name': `${balance.student?.firstName || ''} ${balance.student?.lastName || ''}`,
    'Class': balance.student?.class?.name || '',
    'Academic Year': balance.student?.academicYear?.year || '',
    'Fee Type': balance.feeStructure?.feeType?.name || '',
    'Term': balance.feeStructure?.term || '',
    'Amount Charged': balance.amountCharged,
    'Amount Paid': balance.amountPaid,
    'Balance': balance.amountCharged - balance.amountPaid,
    'Status': balance.status,
    'Due Date': balance.dueDate ? balance.dueDate.toISOString().split('T')[0] : '',
    'Created At': balance.createdAt.toISOString(),
  }));
}

async function exportFeeStructures(schoolId: string, filters?: any) {
  const where: any = { schoolId };

  if (filters?.classId) where.classId = filters.classId;
  if (filters?.academicYearId) where.academicYearId = filters.academicYearId;

  const feeStructures = await prisma.feeStructure.findMany({
    where,
    include: {
      feeType: true,
      class: true,
      academicYear: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return feeStructures.map(structure => ({
    'Fee Type': structure.feeType?.name || '',
    'Class': structure.class?.name || '',
    'Academic Year': structure.academicYear?.year || '',
    'Term': structure.term || '',
    'Amount': structure.amount,
    'Is Active': structure.isActive ? 'Yes' : 'No',
    'Created At': structure.createdAt.toISOString(),
  }));
}

function convertToCSV(data: any[], type: string): string {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available';
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}




















