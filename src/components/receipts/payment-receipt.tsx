"use client"

import { useRef } from "react"

interface PaymentReceiptProps {
  payment: {
    receiptNumber: string
    studentName: string
    studentId: string
    feeType: string
    term: string
    amount: number
    paymentMethod: string
    paymentDate: string
    referenceNumber?: string
    notes?: string
  }
  schoolInfo?: {
    name: string
    address: string
    phone: string
    email: string
    logo?: string
  }
}

export default function PaymentReceipt({ payment, schoolInfo }: PaymentReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const defaultSchoolInfo = {
    name: "Rodrise Education School",
    address: "123 Education Street, City, Country",
    phone: "+1234567890",
    email: "info@rodrise.edu"
  }

  const school = schoolInfo || defaultSchoolInfo

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Payment Receipt - ${payment.receiptNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                .school-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                .school-details { font-size: 12px; color: #666; }
                .receipt-title { font-size: 16px; font-weight: bold; text-align: center; margin: 15px 0; }
                .receipt-number { font-size: 14px; font-weight: bold; margin-bottom: 20px; }
                .payment-details { margin-bottom: 20px; }
                .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .detail-label { font-weight: bold; }
                .amount-section { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 15px 0; margin: 20px 0; }
                .total-amount { font-size: 18px; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 10px; }
                @media print {
                  body { margin: 0; }
                  .receipt { border: none; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Print Receipt
        </button>
      </div>

      <div ref={receiptRef} className="receipt bg-white border-2 border-gray-800 p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="header">
          <div className="school-name">{school.name}</div>
          <div className="school-details">
            {school.address}<br />
            Phone: {school.phone} | Email: {school.email}
          </div>
        </div>

        {/* Receipt Title */}
        <div className="receipt-title">PAYMENT RECEIPT</div>

        {/* Receipt Number */}
        <div className="receipt-number">
          Receipt No: {payment.receiptNumber}
        </div>

        {/* Payment Details */}
        <div className="payment-details">
          <div className="detail-row">
            <span className="detail-label">Student Name:</span>
            <span>{payment.studentName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Student ID:</span>
            <span>{payment.studentId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Fee Type:</span>
            <span>{payment.feeType}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Term:</span>
            <span>{payment.term}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Method:</span>
            <span>{payment.paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Date:</span>
            <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
          </div>
          {payment.referenceNumber && (
            <div className="detail-row">
              <span className="detail-label">Reference:</span>
              <span>{payment.referenceNumber}</span>
            </div>
          )}
        </div>

        {/* Amount Section */}
        <div className="amount-section">
          <div className="detail-row total-amount">
            <span>Total Amount:</span>
            <span>${payment.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="mb-4">
            <div className="detail-label mb-2">Notes:</div>
            <div className="text-sm">{payment.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your payment!</p>
          <p>This receipt serves as proof of payment.</p>
          <p>Please keep this receipt for your records.</p>
        </div>

        {/* Signature Line */}
        <div className="signature-line">
          <div className="text-center text-sm">
            Authorized Signature
          </div>
        </div>

        {/* Print Info */}
        <div className="text-center text-xs text-gray-500 mt-4">
          Printed on: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
}








