"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useTheme, themes } from "@/contexts/ThemeContext"
import { FeeBalance } from "@/types"
import { useFeeBalances } from "@/hooks/useApi"

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
  
  // Always call useTheme hook - hooks must be called unconditionally
  const themeContext = useTheme();
  
  // Safe theme access with fallback
  const currentTheme = themes[themeContext?.theme || 'cyan'] || themes.cyan;

  // Use the fee balances hook
  const { data, loading, error, getFeeBalances } = useFeeBalances()

  // Fetch fee balances from API
  useEffect(() => {
    getFeeBalances()
  }, [])

  const feeBalances = data?.feeBalances || []

  // Transform fee balances to student balances format
  const studentBalances: StudentBalance[] = feeBalances.reduce((acc: StudentBalance[], balance: FeeBalance) => {
    const existingStudent = acc.find(s => s.studentId === balance.studentId)
    const amountCharged = parseFloat(balance.amountCharged.toString())
    const amountPaid = parseFloat(balance.amountPaid.toString())
    const balanceAmount = parseFloat(balance.balance.toString())
    
    if (existingStudent) {
      existingStudent.totalFees += amountCharged
      existingStudent.totalPaid += amountPaid
      existingStudent.outstandingBalance += balanceAmount
    } else {
      acc.push({
        id: balance.studentId,
        studentName: `${balance.student?.firstName || ''} ${balance.student?.lastName || ''}`,
        studentId: balance.studentId,
        class: balance.student?.class?.name || '',
        academicYear: balance.academicYear?.year || '',
        totalFees: amountCharged,
        totalPaid: amountPaid,
        outstandingBalance: balanceAmount,
        lastPaymentDate: '', // Will be populated from payments
        status: balanceAmount <= 0 ? 'paid' : balanceAmount < amountCharged ? 'current' : 'overdue',
        term1Balance: 0, // Will be calculated based on terms
        term2Balance: 0,
        term3Balance: 0
      })
    }
    
    return acc
  }, [])

  // Real fee statements data will be loaded from API
  const feeStatements: FeeStatement[] = []

  const totalOutstanding = studentBalances.reduce((sum: number, balance: StudentBalance) => sum + balance.outstandingBalance, 0)
  const overdueStudents = studentBalances.filter((b: StudentBalance) => b.status === 'overdue').length
  const currentStudents = studentBalances.filter((b: StudentBalance) => b.status === 'current').length
  const paidStudents = studentBalances.filter((b: StudentBalance) => b.status === 'paid').length

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
      <div className="min-h-screen bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Balances
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">Track outstanding balances and generate comprehensive fee statements</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Outstanding</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  ${totalOutstanding.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Overdue Students</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {overdueStudents}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-xl">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Current Students</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {currentStudents}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Fully Paid</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {paidStudents}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs Container */}
        <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-white/30 overflow-hidden">
          {/* Enhanced Tab Navigation */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              <button
                onClick={() => setActiveTab('balances')}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'balances'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Student Balances</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('statements')}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === 'statements'
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Fee Statements</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'balances' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Student Balances</h3>
                                          <p className="text-gray-300">Monitor outstanding balances and payment status</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export Report</span>
                      </div>
                    </button>
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        <span>Send Reminders</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Enhanced Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                      />
                    </div>
                    <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50">
                      <option value="">All Status</option>
                      <option value="current">Current</option>
                      <option value="overdue">Overdue</option>
                      <option value="paid">Paid</option>
                    </select>
                    <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50">
                      <option value="">All Classes</option>
                      <option value="grade9">Grade 9</option>
                      <option value="grade10">Grade 10</option>
                      <option value="grade11">Grade 11</option>
                    </select>
                    <button className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300">
                      Apply Filters
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total Fees
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total Paid
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Outstanding
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Last Payment
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {studentBalances.map((balance: StudentBalance) => (
                          <tr key={balance.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{balance.studentName}</div>
                                <div className="text-sm text-gray-500">{balance.studentId}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{balance.class}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">${balance.totalFees.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-700">${balance.totalPaid.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-red-700">${balance.outstandingBalance.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{balance.lastPaymentDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                                balance.status === 'paid' 
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                                  : balance.status === 'current'
                                  ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200'
                                  : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200'
                              }`}>
                                {balance.status.charAt(0).toUpperCase() + balance.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline transition-colors duration-200">
                                  View
                                </button>
                                <button className="text-green-600 hover:text-green-900 font-medium hover:underline transition-colors duration-200">
                                  Statement
                                </button>
                                <button className="text-orange-600 hover:text-orange-900 font-medium hover:underline transition-colors duration-200">
                                  Remind
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statements' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">Fee Statements</h3>
                    <p className="text-gray-600">Generate and manage detailed fee statements</p>
                  </div>
                  <div className="flex space-x-3">
                    <select 
                      value={selectedStudent} 
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                    >
                      <option value="">Select Student</option>
                      {studentBalances.map((balance: StudentBalance) => (
                        <option key={balance.id} value={balance.id}>
                          {balance.studentName} - {balance.studentId}
                        </option>
                      ))}
                    </select>
                    <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Generate Statement</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Fee Type
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Term
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Paid
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Balance
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Due Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {feeStatements.map((statement) => (
                          <tr key={statement.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{statement.studentName}</div>
                                <div className="text-sm text-gray-500">{statement.studentId}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{statement.feeType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{statement.term}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">${statement.amount.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-700">${statement.paid.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-red-700">${statement.balance.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">{statement.dueDate}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                                statement.status === 'paid' 
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200' 
                                  : statement.status === 'partial'
                                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200'
                                  : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200'
                              }`}>
                                {statement.status.charAt(0).toUpperCase() + statement.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button className="text-indigo-600 hover:text-indigo-900 font-medium hover:underline transition-colors duration-200">
                                  View
                                </button>
                                <button className="text-green-600 hover:text-green-900 font-medium hover:underline transition-colors duration-200">
                                  Print
                                </button>
                                <button className="text-blue-600 hover:text-blue-900 font-medium hover:underline transition-colors duration-200">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


