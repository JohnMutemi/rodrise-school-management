"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface PlatformHealth {
  uptime: string
  responseTime: number
  activeUsers: number
  totalSchools: number
  activeSchools: number
  systemLoad: number
  databaseSize: string
  lastBackup: string
}

interface School {
  id: string
  name: string
  location: string
  status: 'active' | 'inactive' | 'pending'
  students: number
  revenue: number
  lastActivity: string
  adminEmail: string
}

interface SystemUser {
  id: string
  name: string
  email: string
  role: 'superadmin' | 'school_admin' | 'staff'
  school?: string
  status: 'active' | 'inactive'
  lastLogin: string
  permissions: string[]
}

interface SystemMetrics {
  totalRevenue: number
  totalStudents: number
  totalPayments: number
  averageCollectionRate: number
  monthlyGrowth: number
  activeSessions: number
  errorRate: number
}

export default function SuperAdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'users' | 'system' | 'analytics'>('overview')

  // Redirect if not authenticated or not superadmin
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session || session.user?.role !== 'superadmin') {
    router.push('/superadmin/login')
    return null
  }

  // Mock platform health data
  const platformHealth: PlatformHealth = {
    uptime: "99.9%",
    responseTime: 245,
    activeUsers: 156,
    totalSchools: 12,
    activeSchools: 11,
    systemLoad: 23,
    databaseSize: "2.4 GB",
    lastBackup: "2 hours ago"
  }

  // Mock schools data
  const schools: School[] = [
    {
      id: "1",
      name: "Rodrise Education School",
      location: "Nairobi, Kenya",
      status: 'active',
      students: 450,
      revenue: 125000,
      lastActivity: "2 minutes ago",
      adminEmail: "admin@rodrise.edu"
    },
    {
      id: "2",
      name: "Bright Future Academy",
      location: "Mombasa, Kenya",
      status: 'active',
      students: 320,
      revenue: 89000,
      lastActivity: "15 minutes ago",
      adminEmail: "admin@brightfuture.edu"
    },
    {
      id: "3",
      name: "Excellence Learning Center",
      location: "Kisumu, Kenya",
      status: 'pending',
      students: 0,
      revenue: 0,
      lastActivity: "1 day ago",
      adminEmail: "admin@excellence.edu"
    },
    {
      id: "4",
      name: "Knowledge Hub School",
      location: "Nakuru, Kenya",
      status: 'inactive',
      students: 280,
      revenue: 75000,
      lastActivity: "3 days ago",
      adminEmail: "admin@knowledgehub.edu"
    }
  ]

  // Mock system users data
  const systemUsers: SystemUser[] = [
    {
      id: "1",
      name: "John Admin",
      email: "john@rodrise.edu",
      role: 'superadmin',
      status: 'active',
      lastLogin: "5 minutes ago",
      permissions: ['all']
    },
    {
      id: "2",
      name: "Sarah School Admin",
      email: "sarah@rodrise.edu",
      role: 'school_admin',
      school: "Rodrise Education School",
      status: 'active',
      lastLogin: "1 hour ago",
      permissions: ['students', 'fees', 'reports']
    },
    {
      id: "3",
      name: "Mike Staff",
      email: "mike@rodrise.edu",
      role: 'staff',
      school: "Rodrise Education School",
      status: 'active',
      lastLogin: "2 hours ago",
      permissions: ['students', 'payments']
    },
    {
      id: "4",
      name: "Lisa Admin",
      email: "lisa@brightfuture.edu",
      role: 'school_admin',
      school: "Bright Future Academy",
      status: 'active',
      lastLogin: "30 minutes ago",
      permissions: ['students', 'fees', 'reports']
    }
  ]

  // Mock system metrics
  const systemMetrics: SystemMetrics = {
    totalRevenue: 289000,
    totalStudents: 1050,
    totalPayments: 1250,
    averageCollectionRate: 94.2,
    monthlyGrowth: 18.5,
    activeSessions: 45,
    errorRate: 0.02
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-800'
      case 'school_admin': return 'bg-blue-100 text-blue-800'
      case 'staff': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SuperAdmin Dashboard</h1>
              <p className="text-gray-600">Platform management and system oversight</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
              <button
                onClick={() => router.push('/superadmin/login')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">System Uptime</h3>
            <p className="text-2xl font-bold text-green-600">{platformHealth.uptime}</p>
            <p className="text-xs text-gray-600">Response: {platformHealth.responseTime}ms</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Schools</h3>
            <p className="text-2xl font-bold text-blue-600">{platformHealth.activeSchools}</p>
            <p className="text-xs text-gray-600">of {platformHealth.totalSchools} total</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-indigo-600">{platformHealth.activeUsers}</p>
            <p className="text-xs text-gray-600">Currently online</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">System Load</h3>
            <p className="text-2xl font-bold text-orange-600">{platformHealth.systemLoad}%</p>
            <p className="text-xs text-gray-600">Database: {platformHealth.databaseSize}</p>
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
                onClick={() => setActiveTab('schools')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schools'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Schools
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'system'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                System
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
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* System Metrics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">Total Revenue</h4>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(systemMetrics.totalRevenue)}</p>
                      <p className="text-xs text-green-600">+{systemMetrics.monthlyGrowth}% this month</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">Total Students</h4>
                      <p className="text-xl font-bold text-blue-600">{systemMetrics.totalStudents.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Across all schools</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">Collection Rate</h4>
                      <p className="text-xl font-bold text-indigo-600">{formatPercentage(systemMetrics.averageCollectionRate)}</p>
                      <p className="text-xs text-gray-600">Average across schools</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">Error Rate</h4>
                      <p className="text-xl font-bold text-red-600">{formatPercentage(systemMetrics.errorRate)}</p>
                      <p className="text-xs text-gray-600">System errors</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">New payment received at Rodrise Education School</span>
                        </div>
                        <span className="text-xs text-gray-500">2 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">New student registered at Bright Future Academy</span>
                        </div>
                        <span className="text-xs text-gray-500">15 minutes ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">System backup completed successfully</span>
                        </div>
                        <span className="text-xs text-gray-500">2 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-gray-700">New school admin account created</span>
                        </div>
                        <span className="text-xs text-gray-500">1 day ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schools' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">School Management</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Add New School
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          School
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schools.map((school) => (
                        <tr key={school.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{school.name}</div>
                              <div className="text-sm text-gray-500">{school.adminEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{school.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(school.status)}`}>
                              {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{school.students}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(school.revenue)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{school.lastActivity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                View
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                {school.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
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

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Add New User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          School
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {systemUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                              {user.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.school || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.lastLogin}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-indigo-600 hover:text-indigo-900">
                                Edit
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
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

            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">CPU Usage:</span>
                          <span className="text-sm font-medium">23%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Memory Usage:</span>
                          <span className="text-sm font-medium">67%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Disk Usage:</span>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Network Load:</span>
                          <span className="text-sm font-medium">12%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Database Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Size:</span>
                          <span className="text-sm font-medium">{platformHealth.databaseSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Connections:</span>
                          <span className="text-sm font-medium">24/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Backup:</span>
                          <span className="text-sm font-medium">{platformHealth.lastBackup}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Backup Status:</span>
                          <span className="text-sm text-green-600 font-medium">Healthy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <div className="text-center">
                        <div className="text-lg font-semibold">Backup Database</div>
                        <div className="text-sm opacity-90">Create system backup</div>
                      </div>
                    </button>
                    <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <div className="text-center">
                        <div className="text-lg font-semibold">Clear Cache</div>
                        <div className="text-sm opacity-90">Refresh system cache</div>
                      </div>
                    </button>
                    <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <div className="text-center">
                        <div className="text-lg font-semibold">System Logs</div>
                        <div className="text-sm opacity-90">View system logs</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Analytics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Revenue Analytics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Revenue:</span>
                          <span className="text-sm font-medium">{formatCurrency(systemMetrics.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly Growth:</span>
                          <span className="text-sm text-green-600">+{systemMetrics.monthlyGrowth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Average per School:</span>
                          <span className="text-sm font-medium">{formatCurrency(systemMetrics.totalRevenue / platformHealth.activeSchools)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">User Analytics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active Sessions:</span>
                          <span className="text-sm font-medium">{systemMetrics.activeSessions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Students:</span>
                          <span className="text-sm font-medium">{systemMetrics.totalStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Payments:</span>
                          <span className="text-sm font-medium">{systemMetrics.totalPayments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">School Performance</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3">
                      {schools.filter(s => s.status === 'active').map((school) => (
                        <div key={school.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{school.name}</span>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">{school.students} students</span>
                            <span className="text-sm font-medium">{formatCurrency(school.revenue)}</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(school.revenue / systemMetrics.totalRevenue) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}







