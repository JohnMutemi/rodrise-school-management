"use client"

import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        {/* Header with enhanced styling */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back, {session?.user?.name || 'Admin'}! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-green-600 mt-1">↗ +0% from last month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Fees</p>
                <p className="text-3xl font-bold text-gray-900">$0</p>
                <p className="text-xs text-green-600 mt-1">↗ +0% from last month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Payments</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-xs text-blue-600 mt-1">↗ +0% from last month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Balances</p>
                <p className="text-3xl font-bold text-gray-900">$0</p>
                <p className="text-xs text-orange-600 mt-1">↗ +0% from last month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚖️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions - Enhanced */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
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

        {/* Enhanced Welcome Message */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Rodrise School Management</h2>
              <p className="text-indigo-100">
                Get started by exploring the modules below or use the quick actions above.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
