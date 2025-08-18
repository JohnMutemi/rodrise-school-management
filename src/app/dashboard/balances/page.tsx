"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface StudentBalance {
  id: string
  studentName: string
  studentId: string
  class: string
  academicYear: string
  totalFees: number
  totalPaid: number
  outstandingBalance: number
  lastPaymentDate: string
  status: 'current' | 'overdue' | 'paid'
  term1Balance: number
  term2Balance: number
  term3Balance: number
}

interface FeeStatement {
  id: string
  studentName: string
  studentId: string
  feeType: string
  term: string
  amount: number
  paid: number
  balance: number
  dueDate: string
  status: 'paid' | 'partial' | 'unpaid'
}

export default function BalancesPage() {
  const [activeTab, setActiveTab] = useState<'balances' | 'statements'>('balances')
  const [selectedStudent, setSelectedStudent] = useState<string>('')

  // Mock data for student balances
  const mockStudentBalances: StudentBalance[] = [
    {
      id: "1",
      studentName: "John Doe",
      studentId: "STU001",
      class: "Grade 10A",
      academicYear: "2024-2025",
      totalFees: 1650,
      totalPaid: 500,
      outstandingBalance: 1150,
      lastPaymentDate: "2024-01-15",
      status: 'current',
      term1Balance: 500,
      term2Balance: 500,
      term3Balance: 150
    },
    {
      id: "2",
      studentName: "Sarah Smith",
      studentId: "STU002",
      class: "Grade 9B",
      academicYear: "2024-2025",
      totalFees: 1200,
      totalPaid: 1200,
      outstandingBalance: 0,
      lastPaymentDate: "2024-01-20",
      status: 'paid',
      term1Balance: 0,
      term2Balance: 0,
      term3Balance: 0
    },
    {
      id: "3",
      studentName: "Mike Johnson",
      studentId: "STU003",
      class: "Grade 11A",
      academicYear: "2024-2025",
      totalFees: 1800,
      totalPaid: 300,
      outstandingBalance: 1500,
      lastPaymentDate: "2024-01-10",
      status: 'overdue',
      term1Balance: 600,
      term2Balance: 600,
      term3Balance: 300
    }
  ]

  // Mock data for fee statements
  const mockFeeStatements: FeeStatement[] = [
    {
      id: "1",
      studentName: "John Doe",
      studentId: "STU001",
      feeType: "Tuition Fee",
      term: "Term 1",
      amount: 500,
      paid: 500,
      balance: 0,
      dueDate: "2024-01-31",
      status: 'paid'
    },
    {
      id: "2",
      studentName: "John Doe",
      studentId: "STU001",
      feeType: "Tuition Fee",
      term: "Term 2",
      amount: 500,
      paid: 0,
      balance: 500,
      dueDate: "2024-04-30",
      status: 'unpaid'
    },
    {
      id: "3",
      studentName: "John Doe",
      studentId: "STU001",
      feeType: "Library Fee",
      term: "Term 1",
      amount: 150,
      paid: 0,
      balance: 150,
      dueDate: "2024-01-31",
      status: 'unpaid'
    }
  ]

  const totalOutstanding = mockStudentBalances.reduce((sum, balance) => sum + balance.outstandingBalance, 0)
  const overdueStudents = mockStudentBalances.filter(b => b.status === 'overdue').length
  const currentStudents = mockStudentBalances.filter(b => b.status === 'current').length
  const paidStudents = mockStudentBalances.filter(b => b.status === 'paid').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'current': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatementStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Balances</h1>
          <p className="text-gray-600">Track outstanding balances and generate fee statements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Outstanding</h3>
            <p className="text-2xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Overdue Students</h3>
            <p className="text-2xl font-bold text-orange-600">{overdueStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Current Students</h3>
            <p className="text-2xl font-bold text-blue-600">{currentStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Fully Paid</h3>
            <p className="text-2xl font-bold text-green-600">{paidStudents}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('balances')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'balances'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Student Balances
              </button>
              <button
                onClick={() => setActiveTab('statements')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'statements'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Fee Statements
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'balances' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Student Balances</h3>
                  <div className="flex space-x-2">
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Generate Statements
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      Send Reminders
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex space-x-4 mb-4">
                  <input
                    type="text"
                    placeholder="Search by student name or ID..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Status</option>
                    <option value="paid">Fully Paid</option>
                    <option value="current">Current</option>
                    <option value="overdue">Overdue</option>
                  </select>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Classes</option>
                    <option value="grade10">Grade 10</option>
                    <option value="grade11">Grade 11</option>
                    <option value="grade12">Grade 12</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Fees
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Paid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Outstanding
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mockStudentBalances.map((balance) => (
                        <tr key={balance.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{balance.studentName}</div>
                              <div className="text-sm text-gray-500">{balance.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{balance.class}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${balance.totalFees.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600">${balance.totalPaid.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              balance.outstandingBalance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ${balance.outstandingBalance.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(balance.status)}`}>
                              {balance.status.charAt(0).toUpperCase() + balance.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{balance.lastPaymentDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                View Details
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                Generate Statement
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                Send Reminder
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'statements' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Fee Statements</h3>
                  <div className="flex space-x-2">
                    <select 
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">All Students</option>
                      {mockStudentBalances.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.studentName} ({student.studentId})
                        </option>
                      ))}
                    </select>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      Generate Statement
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      Print All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          Paid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
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
                      {mockFeeStatements.map((statement) => (
                        <tr key={statement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{statement.studentName}</div>
                              <div className="text-sm text-gray-500">{statement.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{statement.feeType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{statement.term}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${statement.amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-green-600">${statement.paid.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              statement.balance > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              ${statement.balance.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{statement.dueDate}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatementStatusColor(statement.status)}`}>
                              {statement.status.charAt(0).toUpperCase() + statement.status.slice(1)}
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
                              <button className="text-blue-600 hover:text-blue-900">
                                Email
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

