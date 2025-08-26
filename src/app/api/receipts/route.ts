import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const generateReceiptSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  format: z.enum(['pdf', 'html']).default('pdf'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const format = searchParams.get('format') || 'pdf'

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    const payment = await prisma.feePayment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            class: true,
            academicYear: true,
            school: true
          }
        },
        academicYear: true,
        term: true,
        paymentMethod: true,
        paymentDetails: {
          include: {
            feeType: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const receiptData = generateReceiptData(payment)
    
    if (format === 'html') {
      const htmlReceipt = generateHTMLReceipt(receiptData)
      return new NextResponse(htmlReceipt, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
    } else {
      // For PDF, we'll return the receipt data that can be used by a PDF generator
      return NextResponse.json({
        receipt: receiptData,
        message: 'Receipt data generated successfully. Use a PDF library to generate the actual PDF.'
      })
    }

  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = generateReceiptSchema.parse(body)

    const payment = await prisma.feePayment.findUnique({
      where: { id: validatedData.paymentId },
      include: {
        student: {
          include: {
            class: true,
            academicYear: true,
            school: true
          }
        },
        academicYear: true,
        term: true,
        paymentMethod: true,
        paymentDetails: {
          include: {
            feeType: true
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    const receiptData = generateReceiptData(payment)
    
    // Store receipt record in database
    const receipt = await prisma.receipt.create({
      data: {
        paymentId: payment.id,
        receiptNumber: payment.receiptNumber,
        generatedAt: new Date(),
        // In a real implementation, you would store the PDF file path here
        pdfPath: `receipts/${payment.receiptNumber}.pdf`,
      }
    })

    return NextResponse.json({
      message: 'Receipt generated successfully',
      receipt: {
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        generatedAt: receipt.generatedAt,
        downloadUrl: `/api/receipts/${receipt.id}/download`
      },
      receiptData
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateReceiptData(payment: any) {
  const student = payment.student
  const school = student?.school

  return {
    receiptNumber: payment.receiptNumber,
    paymentDate: payment.paymentDate,
    studentName: `${student?.firstName} ${student?.lastName}`,
    admissionNumber: student?.admissionNumber,
    class: student?.class?.name,
    academicYear: student?.academicYear?.year,
    term: payment.term?.name,
    amountPaid: parseFloat(payment.amountPaid.toString()),
    paymentMethod: payment.paymentMethod?.name,
    referenceNumber: payment.referenceNumber,
    schoolName: school?.name,
    schoolAddress: school?.address,
    schoolPhone: school?.phone,
    schoolEmail: school?.email,
    paymentDetails: payment.paymentDetails.map((detail: any) => ({
      feeType: detail.feeType?.name,
      amount: parseFloat(detail.amount.toString())
    })),
    totalAmount: payment.paymentDetails.reduce((sum: number, detail: any) => 
      sum + parseFloat(detail.amount.toString()), 0
    )
  }
}

function generateHTMLReceipt(receiptData: any) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${receiptData.receiptNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .school-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .school-details {
            color: #666;
            font-size: 14px;
        }
        .receipt-title {
            font-size: 20px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
        }
        .receipt-number {
            font-size: 18px;
            color: #666;
            margin-bottom: 20px;
        }
        .student-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-group {
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        }
        .info-value {
            color: #666;
        }
        .payment-details {
            margin-bottom: 30px;
        }
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        .payment-table th,
        .payment-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .payment-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }
        .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .signature-line {
            margin-top: 50px;
            border-top: 1px solid #333;
            width: 200px;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="school-name">${receiptData.schoolName || 'School Name'}</div>
            <div class="school-details">
                ${receiptData.schoolAddress || ''}<br>
                Phone: ${receiptData.schoolPhone || ''} | Email: ${receiptData.schoolEmail || ''}
            </div>
        </div>

        <div class="receipt-title">OFFICIAL RECEIPT</div>
        <div class="receipt-number">Receipt No: ${receiptData.receiptNumber}</div>

        <div class="student-info">
            <div>
                <div class="info-group">
                    <div class="info-label">Student Name:</div>
                    <div class="info-value">${receiptData.studentName}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Admission Number:</div>
                    <div class="info-value">${receiptData.admissionNumber}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Class:</div>
                    <div class="info-value">${receiptData.class}</div>
                </div>
            </div>
            <div>
                <div class="info-group">
                    <div class="info-label">Academic Year:</div>
                    <div class="info-value">${receiptData.academicYear}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Term:</div>
                    <div class="info-value">${receiptData.term || 'N/A'}</div>
                </div>
                <div class="info-group">
                    <div class="info-label">Payment Date:</div>
                    <div class="info-value">${new Date(receiptData.paymentDate).toLocaleDateString()}</div>
                </div>
            </div>
        </div>

        <div class="payment-details">
            <div class="info-label">Payment Details:</div>
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>Fee Type</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${receiptData.paymentDetails.map((detail: any) => `
                        <tr>
                            <td>${detail.feeType}</td>
                            <td>$${detail.amount.toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr class="total-row">
                        <td><strong>Total Amount</strong></td>
                        <td><strong>$${receiptData.totalAmount.toFixed(2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="info-group">
            <div class="info-label">Payment Method:</div>
            <div class="info-value">${receiptData.paymentMethod}</div>
        </div>

        ${receiptData.referenceNumber ? `
        <div class="info-group">
            <div class="info-label">Reference Number:</div>
            <div class="info-value">${receiptData.referenceNumber}</div>
        </div>
        ` : ''}

        <div class="footer">
            <div class="signature-line"></div>
            <div style="margin-top: 10px;">Authorized Signature</div>
            <div style="margin-top: 30px;">
                This is a computer generated receipt and does not require a physical signature.
            </div>
        </div>
    </div>
</body>
</html>
  `
}























