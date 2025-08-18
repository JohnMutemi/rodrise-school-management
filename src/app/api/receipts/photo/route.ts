import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()

interface PhotoReceiptData {
  paymentId: string
  receiptNumber: string
  notes?: string
  amount: number
  paymentMethod: string
  captureDate: Date
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const paymentId = formData.get('paymentId') as string
    const receiptNumber = formData.get('receiptNumber') as string
    const notes = formData.get('notes') as string
    const amount = parseFloat(formData.get('amount') as string)
    const paymentMethod = formData.get('paymentMethod') as string
    const captureDate = new Date(formData.get('captureDate') as string)
    const photoFile = formData.get('photoFile') as File

    if (!paymentId || !receiptNumber || !photoFile) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, receiptNumber, or photoFile' },
        { status: 400 }
      )
    }

    // Validate payment exists
    const payment = await prisma.feePayment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = photoFile.name.split('.').pop() || 'jpg'
    const filename = `receipt_${receiptNumber}_${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)

    // Convert File to Buffer and save
    const bytes = await photoFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save photo receipt record to database
    const photoReceipt = await prisma.photoReceipt.create({
      data: {
        paymentId,
        receiptNumber,
        photoPath: `/uploads/receipts/${filename}`,
        notes: notes || null,
        amount,
        paymentMethod,
        captureDate,
        uploadedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Photo receipt uploaded successfully',
      photoReceipt: {
        id: photoReceipt.id,
        receiptNumber: photoReceipt.receiptNumber,
        photoPath: photoReceipt.photoPath,
        uploadedAt: photoReceipt.uploadedAt
      }
    })

  } catch (error) {
    console.error('Photo receipt upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error during photo receipt upload' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')
    const receiptNumber = searchParams.get('receiptNumber')

    if (!paymentId && !receiptNumber) {
      return NextResponse.json(
        { error: 'Either paymentId or receiptNumber is required' },
        { status: 400 }
      )
    }

    const where: any = {}
    if (paymentId) where.paymentId = paymentId
    if (receiptNumber) where.receiptNumber = receiptNumber

    const photoReceipts = await prisma.photoReceipt.findMany({
      where,
      include: {
        payment: {
          include: {
            student: {
              select: {
                firstName: true,
                lastName: true,
                admissionNumber: true
              }
            }
          }
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      photoReceipts: photoReceipts.map(receipt => ({
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        photoPath: receipt.photoPath,
        notes: receipt.notes,
        amount: receipt.amount,
        paymentMethod: receipt.paymentMethod,
        captureDate: receipt.captureDate,
        uploadedAt: receipt.uploadedAt,
        student: receipt.payment.student
      }))
    })

  } catch (error) {
    console.error('Photo receipt fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching photo receipts' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

