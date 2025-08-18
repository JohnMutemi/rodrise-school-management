"use client"

import { useRef } from "react"

interface BalanceStatementProps {
  student: {
    id: string
    name: string
    studentId: string
    class: string
    academicYear: string
    totalFees: number
    totalPaid: number
    outstandingBalance: number
    lastPaymentDate: string
    status: string
  }
  statements: Array<{
    id: string
    feeType: string
    term: string
    amount: number
    paid: number
    balance: number
    dueDate: string
    status: string
  }>
  payments: Array<{
    id: string
    receiptNumber: string
    paymentDate: string
    amount: number
    paymentMethod: string
    feeType: string
    term: string
  }>
  schoolInfo?: {
    name: string
    address: string
    phone: string
    email: string
    logo?: string
  }
}

export default function BalanceStatement({ 
  student, 
  statements, 
  payments, 
  schoolInfo 
}: BalanceStatementProps) {
  const statementRef = useRef<HTMLDivElement>(null)

  const defaultSchoolInfo = {
    name: "Rodrise Education School",
    address: "123 Education Street, City, Country",
    phone: "+1234567890",
    email: "info@rodrise.edu"
  }

  const school = schoolInfo || defaultSchoolInfo

  const handlePrint = () => {
    if (statementRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Fee Statement - ${student.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .statement { max-width: 800px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; }
                .school-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
                .school-details { font-size: 12px; color: #666; }
                .statement-title { font-size: 18px; font-weight: bold; text-align: center; margin: 15px 0; }
                .student-info { margin-bottom: 20px; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .info-label { font-weight: bold; }
                .summary-section { border: 1px solid #000; padding: 15px; margin: 20px 0; }
                .summary-title { font-weight: bold; margin-bottom: 10px; }
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .total-row { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
                .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .table th, .table td { border: 1px solid #000; padding: 8px; text-align: left; }
                .table th { background-color: #f0f0f0; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 10px; }
                @media print {
                  body { margin: 0; }
                  .statement { border: none; }
                }
              </style>
            </head>
            <body>
              ${statementRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600'
      case 'partial': return 'text-yellow-600'
      case 'unpaid': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Fee Statement</h3>
        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Print Statement
        </button>
      </div>

      <div ref={statementRef} className="statement bg-white border-2 border-gray-800 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="header">
          <div className="school-name">{school.name}</div>
          <div className="school-details">
            {school.address}<br />
            Phone: {school.phone} | Email: {school.email}
          </div>
        </div>

        {/* Statement Title */}
        <div className="statement-title">FEE STATEMENT</div>

        {/* Student Information */}
        <div className="student-info">
          <div className="info-row">
            <span className="info-label">Student Name:</span>
            <span>{student.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Student ID:</span>
            <span>{student.studentId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Class:</span>
            <span>{student.class}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Academic Year:</span>
            <span>{student.academicYear}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Statement Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <div className="summary-title">FEE SUMMARY</div>
          <div className="summary-row">
            <span>Total Fees:</span>
            <span>${student.totalFees.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Total Paid:</span>
            <span className="text-green-600">${student.totalPaid.toFixed(2)}</span>
          </div>
          <div className="summary-row total-row">
            <span>Outstanding Balance:</span>
            <span className={`font-bold ${student.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${student.outstandingBalance.toFixed(2)}
            </span>
          </div>
          <div className="summary-row">
            <span>Last Payment Date:</span>
            <span>{student.lastPaymentDate}</span>
          </div>
          <div className="summary-row">
            <span>Status:</span>
            <span className={`font-bold ${getStatusColor(student.status)}`}>
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-3">FEE BREAKDOWN</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Term</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((statement) => (
                <tr key={statement.id}>
                  <td>{statement.feeType}</td>
                  <td>{statement.term}</td>
                  <td>${statement.amount.toFixed(2)}</td>
                  <td className="text-green-600">${statement.paid.toFixed(2)}</td>
                  <td className={statement.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${statement.balance.toFixed(2)}
                  </td>
                  <td>{statement.dueDate}</td>
                  <td className={getStatusColor(statement.status)}>
                    {statement.status.charAt(0).toUpperCase() + statement.status.slice(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-lg mb-3">PAYMENT HISTORY</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Payment Date</th>
                  <th>Fee Type</th>
                  <th>Term</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.receiptNumber}</td>
                    <td>{payment.paymentDate}</td>
                    <td>{payment.feeType}</td>
                    <td>{payment.term}</td>
                    <td className="text-green-600">${payment.amount.toFixed(2)}</td>
                    <td>{payment.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Important Notes */}
        <div className="bg-yellow-50 p-4 rounded-md mb-6">
          <h4 className="font-bold text-lg mb-2">IMPORTANT NOTES</h4>
          <ul className="text-sm space-y-1">
            <li>• Outstanding balances must be settled before the due dates</li>
            <li>• Late payments may incur additional charges</li>
            <li>• Please keep this statement for your records</li>
            <li>• Contact the school office for any queries regarding fees</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>This statement is computer generated and does not require a signature.</p>
          <p>For any discrepancies, please contact the school administration.</p>
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








