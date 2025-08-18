"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface Payment {
  id: string
  receiptNumber: string
  studentName: string
  studentId: string
  feeType: string
  term: string
  amount: number
  paymentMethod: string
  paymentDate: string
  status: string
  referenceNumber?: string
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'receipts'>('payments')
  const [showAddForm, setShowAddForm] = useState(false)

  // Mock data for payments
  const mockPayments: Payment[] = [
    {
      id: "1",
      receiptNumber: "RCP001",
      studentName: "John Doe",
      studentId: "STU001",
      feeType: "Tuition Fee",
      term: "Term 1",
      amount: 500,
      paymentMethod: "Cash",
      paymentDate: "2024-01-15",
      status: "Completed",
      referenceNumber: "REF001"
    },
    {
      id: "2",
      receiptNumber: "RCP002",
      studentName: "Sarah Smith",
      studentId: "STU002",
      feeType: "Library Fee",
      term: "Term 1",
      amount: 50,
      paymentMethod: "Bank Transfer",
      paymentDate: "2024-01-16",
      status: "Completed",
      referenceNumber: "REF002"
    },
    {
      id: "3",
      receiptNumber: "RCP003",
      studentName: "Mike Johnson",
      studentId: "STU003",
      feeType: "Laboratory Fee",
      term: "Term 1",
      amount: 100,
      paymentMethod: "Mobile Money",
      paymentDate: "2024-01-17",
      status: "Pending",
      referenceNumber: "REF003"
    }
  ]

  const totalPayments = mockPayments.reduce((sum, payment) => sum + payment.amount, 0)
  const completedPayments = mockPayments.filter(p => p.status === 'Completed').length
  const pendingPayments = mockPayments.filter(p => p.status === 'Pending').length

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Record and manage fee payments</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Payments</h3>
            <p className="text-2xl font-bold text-indigo-600">{mockPayments.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
            <p className="text-2xl font-bold text-green-600">${totalPayments.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-2xl font-bold text-blue-600">{completedPayments}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-2xl font-bold text-orange-600">{pendingPayments}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Payments
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'receipts'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Receipts
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'payments' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Payment Records</h3>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Record Payment
                  </button>
                </div>

                {/* Filters */}
                <div className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search by student name or receipt number..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Payment Methods</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile">Mobile Money</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipt No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fee Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Term
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.receiptNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.studentName}</div>
                              <div className="text-sm text-gray-500">{payment.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.feeType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.term}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {payment.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.paymentDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'Completed' 
                                ? 'bg-green-100 text-green-800' 
                                : payment.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                View
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                Print
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Void
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mockPayments.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payments found. Record your first payment to get started.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'receipts' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Receipt Management</h3>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Generate Receipt
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      Bulk Print
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockPayments.map((payment) => (
                    <div key={payment.id} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{payment.receiptNumber}</h4>
                          <p className="text-sm text-gray-600">{payment.studentName}</p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-medium">${payment.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date:</span>
                          <span>{payment.paymentDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <span>{payment.paymentMethod}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="flex-1 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                          View
                        </button>
                        <button className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                          Print
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

