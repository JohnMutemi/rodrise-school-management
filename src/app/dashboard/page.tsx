"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import Link from "next/link"
import { useStudents } from "@/hooks/useApi"
import { useTheme, themes } from "@/contexts/ThemeContext"

interface DashboardStats {
  totalStudents: number
  totalFeesCharged: number
  totalPayments: number
  outstandingBalance: number
  recentPayments: any[]
  overdueStudents: number
  collectionRate: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: studentsData, loading: studentsLoading } = useStudents()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalFeesCharged: 0,
    totalPayments: 0,
    outstandingBalance: 0,
    recentPayments: [],
    overdueStudents: 0,
    collectionRate: '0'
  })
  const [loading, setLoading] = useState(false)
  
  // Always call useTheme hook, but handle the case where it might not be available
  let themeContext;
  try {
    themeContext = useTheme();
  } catch (error) {
    console.warn('Theme context not available in dashboard page');
  }
  
  // Safe theme access with fallback
  const currentTheme = themes[themeContext?.theme || 'cyan'] || themes.cyan;

  // Fetch dashboard statistics from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/reports?type=financial&schoolId=default')
        if (response.ok) {
          const data = await response.json()
          setDashboardStats({
            totalStudents: data.summary?.totalStudents || 0,
            totalFeesCharged: data.summary?.totalCharged || 0,
            totalPayments: data.summary?.totalPayments || 0,
            outstandingBalance: data.summary?.totalOutstanding || 0,
            recentPayments: data.recentPayments || [],
            overdueStudents: 0, // Will be calculated from balance report
            collectionRate: data.summary?.collectionRate || '0'
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">


        {/* Enhanced Welcome Message */}
        <div className={`mb-8 bg-gradient-to-r ${currentTheme.secondary} rounded-2xl p-8 text-white shadow-xl animate-fade-in`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Rodrise School Management</h2>
              <p className={`${currentTheme.text}`}>
                Get started by exploring the modules below or use the quick actions below.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {studentsLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))
                    ) : (
            <>
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalStudents}</p>
                <p className="text-xs text-green-600 mt-1">↗ Active students</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.secondary} rounded-xl flex items-center justify-center`}>
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Fees Charged</p>
                <p className="text-3xl font-bold text-gray-900">${formatCurrency(dashboardStats.totalFeesCharged)}</p>
                <p className="text-xs text-green-600 mt-1">↗ Total charged</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.secondary} rounded-xl flex items-center justify-center`}>
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900">${formatCurrency(dashboardStats.totalPayments)}</p>
                <p className="text-xs text-blue-600 mt-1">↗ Collected</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.secondary} rounded-xl flex items-center justify-center`}>
                <span className="text-white text-xl">💳</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Outstanding</p>
                <p className="text-3xl font-bold text-gray-900">${formatCurrency(dashboardStats.outstandingBalance)}</p>
                <p className="text-xs text-orange-600 mt-1">↗ Pending</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${currentTheme.secondary} rounded-xl flex items-center justify-center`}>
                <span className="text-white text-xl">⚖️</span>
              </div>
            </div>
          </div>
            </>
          )}
        </div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions - Enhanced */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className={`w-8 h-8 bg-gradient-to-br ${currentTheme.secondary} rounded-lg flex items-center justify-center mr-3`}>
                  <span className="text-white text-sm">⚡</span>
                </span>
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Link href="/dashboard/students" className="block">
                  <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">+</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Add New Student</h4>
                      <p className="text-sm text-gray-600">Register a new student</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/payments" className="block">
                  <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">📄</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Record Payment</h4>
                      <p className="text-sm text-gray-600">Process fee payment</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/reports" className="block">
                  <div className="flex items-center p-4 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <span className="text-white text-lg">📊</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Generate Report</h4>
                      <p className="text-sm text-gray-600">View financial reports</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity - Enhanced */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📈</span>
                </span>
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">No recent activity</p>
                    <p className="text-xs text-gray-500">Start by adding students or recording payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status - Enhanced */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">🔧</span>
                </span>
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Database</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Authentication</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">Last Backup</span>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Never</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
