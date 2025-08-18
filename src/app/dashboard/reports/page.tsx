"use client"

import { useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface FinancialSummary {
  totalRevenue: number
  totalOutstanding: number
  totalCollected: number
  collectionRate: number
  averagePayment: number
  monthlyGrowth: number
}

interface PaymentTrend {
  month: string
  amount: number
  count: number
}

interface FeeTypeBreakdown {
  feeType: string
  total: number
  collected: number
  outstanding: number
  percentage: number
}

interface ClassPerformance {
  className: string
  totalStudents: number
  totalFees: number
  collected: number
  outstanding: number
  collectionRate: number
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'analytics' | 'export'>('overview')
  const [dateRange, setDateRange] = useState('current-month')

  // Mock financial summary data
  const financialSummary: FinancialSummary = {
    totalRevenue: 46500,
    totalOutstanding: 2650,
    totalCollected: 43850,
    collectionRate: 94.3,
    averagePayment: 547.5,
    monthlyGrowth: 12.5
  }

  // Mock payment trends data
  const paymentTrends: PaymentTrend[] = [
    { month: 'Jan', amount: 8500, count: 15 },
    { month: 'Feb', amount: 9200, count: 18 },
    { month: 'Mar', amount: 7800, count: 14 },
    { month: 'Apr', amount: 10500, count: 20 },
    { month: 'May', amount: 9500, count: 17 },
    { month: 'Jun', amount: 11000, count: 22 }
  ]

  // Mock fee type breakdown
  const feeTypeBreakdown: FeeTypeBreakdown[] = [
    { feeType: 'Tuition Fee', total: 30000, collected: 28500, outstanding: 1500, percentage: 95 },
    { feeType: 'Library Fee', total: 8000, collected: 7800, outstanding: 200, percentage: 97.5 },
    { feeType: 'Laboratory Fee', total: 6000, collected: 5500, outstanding: 500, percentage: 91.7 },
    { feeType: 'Sports Fee', total: 2500, collected: 2050, outstanding: 450, percentage: 82 }
  ]

  // Mock class performance data
  const classPerformance: ClassPerformance[] = [
    { className: 'Grade 10A', totalStudents: 25, totalFees: 12500, collected: 12000, outstanding: 500, collectionRate: 96 },
    { className: 'Grade 10B', totalStudents: 22, totalFees: 11000, collected: 10500, outstanding: 500, collectionRate: 95.5 },
    { className: 'Grade 11A', totalStudents: 20, totalFees: 10000, collected: 9500, outstanding: 500, collectionRate: 95 },
    { className: 'Grade 11B', totalStudents: 18, totalFees: 9000, collected: 8500, outstanding: 500, collectionRate: 94.4 },
    { className: 'Grade 12A', totalStudents: 15, totalFees: 4000, collected: 3350, outstanding: 650, collectionRate: 83.8 }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Financial reports, analytics, and data insights</p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Date Range:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="current-quarter">Current Quarter</option>
              <option value="current-year">Current Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Generate Report
            </button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(financialSummary.totalRevenue)}</p>
            <p className="text-xs text-green-600">+{financialSummary.monthlyGrowth}% from last month</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Collected</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalCollected)}</p>
            <p className="text-xs text-gray-600">Collection rate: {formatPercentage(financialSummary.collectionRate)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Outstanding</h3>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(financialSummary.totalOutstanding)}</p>
            <p className="text-xs text-gray-600">Pending collection</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Average Payment</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialSummary.averagePayment)}</p>
            <p className="text-xs text-gray-600">Per transaction</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('financial')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'financial'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Financial Reports
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'export'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Export
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Payment Trends Chart */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Trends</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-8">
                        {paymentTrends.map((trend) => (
                          <div key={trend.month} className="text-center">
                            <div className="text-sm text-gray-600">{trend.month}</div>
                            <div className="text-lg font-bold text-indigo-600">{formatCurrency(trend.amount)}</div>
                            <div className="text-xs text-gray-500">{trend.count} payments</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center text-sm text-gray-500">
                      Monthly payment collection trends
                    </div>
                  </div>
                </div>

                {/* Fee Type Breakdown */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Type Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fee Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Collected
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Outstanding
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Collection Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {feeTypeBreakdown.map((fee) => (
                          <tr key={fee.feeType} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(fee.total)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600">{formatCurrency(fee.collected)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600">{formatCurrency(fee.outstanding)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full" 
                                    style={{ width: `${fee.percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">{formatPercentage(fee.percentage)}</span>
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

            {activeTab === 'financial' && (
              <div className="space-y-6">
                {/* Class Performance */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Class Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Students
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Fees
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Collected
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Outstanding
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Collection Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {classPerformance.map((cls) => (
                          <tr key={cls.className} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{cls.className}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{cls.totalStudents}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatCurrency(cls.totalFees)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600">{formatCurrency(cls.collected)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-red-600">{formatCurrency(cls.outstanding)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full" 
                                    style={{ width: `${cls.collectionRate}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-900">{formatPercentage(cls.collectionRate)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Revenue Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Revenue:</span>
                          <span className="text-sm font-medium">{formatCurrency(financialSummary.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Collected:</span>
                          <span className="text-sm text-green-600">{formatCurrency(financialSummary.totalCollected)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Outstanding:</span>
                          <span className="text-sm text-red-600">{formatCurrency(financialSummary.totalOutstanding)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Collection Rate:</span>
                          <span className="text-sm font-medium">{formatPercentage(financialSummary.collectionRate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average Payment:</span>
                          <span className="text-sm font-medium">{formatCurrency(financialSummary.averagePayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly Growth:</span>
                          <span className="text-sm text-green-600">+{financialSummary.monthlyGrowth}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Methods Analysis */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cash</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Bank Transfer</span>
                          <span className="text-sm font-medium">30%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Mobile Money</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Credit Card</span>
                          <span className="text-sm font-medium">5%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Monthly Comparison */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Comparison</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">This Month</span>
                          <span className="text-sm font-medium text-green-600">{formatCurrency(11000)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Last Month</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(9500)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Growth</span>
                          <span className="text-sm font-medium text-green-600">+15.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outstanding Balances Analysis */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Outstanding Balances Analysis</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(1500)}</div>
                        <div className="text-sm text-gray-600">Overdue (&gt;30 days)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{formatCurrency(800)}</div>
                        <div className="text-sm text-gray-600">Due This Week</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(350)}</div>
                        <div className="text-sm text-gray-600">Due Next Week</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Export Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Financial Reports</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          📊 Monthly Financial Summary
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          💰 Payment Collection Report
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          📈 Revenue Analysis Report
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          ⚠️ Outstanding Balances Report
                        </button>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Student Reports</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          👥 Class-wise Fee Collection
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          📋 Individual Student Statements
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          📊 Fee Type Breakdown
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          📅 Payment Schedule Report
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Export Options</h4>
                    <div className="flex space-x-4">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                        📄 Export as PDF
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        📊 Export as Excel
                      </button>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                        📧 Email Report
                      </button>
                    </div>
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

