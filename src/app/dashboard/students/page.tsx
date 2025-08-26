"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { useTheme, themes } from "@/contexts/ThemeContext"
import { useStudents } from "@/hooks/useApi"
import AddStudentModal from "@/components/modals/add-student-modal"
import EditStudentModal from "@/components/modals/edit-student-modal"
import BulkImportModal from "@/components/modals/bulk-import-modal"
import { Student } from "@/types"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [classes, setClasses] = useState([])
  const [academicYears, setAcademicYears] = useState([])
  const [isClient, setIsClient] = useState(false)
  const { data, loading, error, getStudents, createStudent, updateStudent, deleteStudent } = useStudents()
  
  // Always call useTheme hook - hooks must be called unconditionally
  const themeContext = useTheme();
  
  // Safe theme access with fallback
  const currentTheme = themes[themeContext?.theme || 'cyan'] || themes.cyan;

  // Set client flag to prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      getStudents({
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter
      })
    }
  }, [searchTerm, statusFilter, isClient])

  // Fetch classes and academic years for the modal
  useEffect(() => {
    if (isClient) {
      const fetchModalData = async () => {
        try {
          const [classesResponse, academicYearsResponse] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/academic-years')
          ])
          
          if (classesResponse.ok) {
            const classesData = await classesResponse.json()
            setClasses(classesData.classes || [])
          }
          
          if (academicYearsResponse.ok) {
            const academicYearsData = await academicYearsResponse.json()
            setAcademicYears(academicYearsData.academicYears || [])
          }
        } catch (error) {
          console.error('Error fetching modal data:', error)
        }
      }

      fetchModalData()
    }
  }, [isClient])

  // Prevent hydration mismatch by not rendering until client is ready
  if (!isClient) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center" suppressHydrationWarning>
          <div className="text-white text-lg" suppressHydrationWarning>Loading...</div>
        </div>
      </DashboardLayout>
    )
  }

  const students = data?.students || []
  const pagination = data?.pagination

  const filteredStudents = students

  // Handle edit student
  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setShowEditModal(true)
  }

  // Handle update student
  const handleUpdateStudent = async (studentData: any) => {
    if (!selectedStudent) return
    
    try {
      await updateStudent(selectedStudent.id, studentData)
      // Refresh the students list
      await getStudents({
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter
      })
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  }

  // Handle delete student
  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      return
    }

    try {
      await deleteStudent(student.id)
      // Refresh the students list
      await getStudents({
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter
      })
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student. Please try again.')
    }
  }

  // Handle add student
  const handleAddStudent = async (studentData: any) => {
    try {
      const result = await createStudent(studentData)
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      // Refresh the students list
      await getStudents({
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter
      })
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding student:', error)
      // Re-throw the error so the modal can handle it
      throw error
    }
  }

  // Calculate statistics from real data
  const activeStudents = students.filter((s: Student) => s.status === 'ACTIVE').length
  const totalBalance = students.reduce((sum: number, student: Student) => {
    return sum + (student.feeStatistics?.outstandingBalance || 0)
  }, 0)
  const overdueStudents = students.filter((student: Student) => {
    return (student.feeStatistics?.outstandingBalance || 0) > 0
  }).length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }



  return (
    <DashboardLayout>
      <div className="p-6 min-h-screen bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Student Management
              </h1>
              <p className="text-gray-300 mt-2 text-lg">
                Manage student records, fees, and academic information
              </p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowBulkImportModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center">
                  <span className="mr-2">📁</span>
                  Bulk Import
                </span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <span className="flex items-center">
                  <span className="mr-2">+</span>
                  Add New Student
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                <p className="text-xs text-green-600 mt-1">↗ +{activeStudents} active</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Active Students</p>
                <p className="text-3xl font-bold text-gray-900">{activeStudents}</p>
                <p className="text-xs text-green-600 mt-1">↗ {((activeStudents / students.length) * 100).toFixed(1)}% of total</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
                <p className="text-xs text-red-600 mt-1">↗ {overdueStudents} students owe</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Overdue Students</p>
                <p className="text-3xl font-bold text-gray-900">{overdueStudents}</p>
                <p className="text-xs text-red-600 mt-1">↗ Need attention</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filter */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="Search students by name, parent, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">All Students</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="animate-fade-in">
            <div className="mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            
            {/* Loading skeleton for stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, index) => (
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
              ))}
            </div>

            {/* Loading skeleton for table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading students</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button 
                onClick={() => getStudents()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Students Table */}
        {!loading && !error && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Student Records</h3>
              <p className="text-sm text-gray-600">Showing {filteredStudents.length} of {students.length} students</p>
            </div>
          
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
                    Parent Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student: Student) => (
                  <tr key={student.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-sm">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                          <span className="text-white font-semibold text-sm">
                            {(student.firstName + ' ' + student.lastName).split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                        {student.class?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{student.parentName}</div>
                        <div className="text-sm text-gray-500">{student.parentPhone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        student.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const totalPaid = student.feePayments.reduce((sum: number, payment: any) => sum + parseFloat(payment.amountPaid), 0)
                        const totalCharged = student.feeBalances.reduce((sum: number, balance: any) => sum + parseFloat(balance.amountCharged), 0)
                        const balance = totalCharged - totalPaid
                        return (
                          <div className={`text-sm font-semibold ${
                            balance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(balance)}
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {isClient && student.feePayments.length > 0 
                        ? new Date(student.feePayments[0].paymentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : isClient && student.feePayments.length === 0 
                          ? 'No payments'
                          : 'Loading...'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 transition-all duration-200 hover:scale-110 transform">
                          View
                        </button>
                        <button className="text-green-600 hover:text-green-900 transition-all duration-200 hover:scale-110 transform">
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900 transition-all duration-200 hover:scale-110 transform">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-gray-400 text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
        )}

        {/* Modals */}
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddStudent}
          classes={classes}
          academicYears={academicYears}
        />

        <BulkImportModal
          isOpen={showBulkImportModal}
          onClose={() => setShowBulkImportModal(false)}
          onImport={async (data) => {
            console.log('Importing students:', data)
            // TODO: Implement API call to bulk import students
            await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
            getStudents() // Refresh the list
          }}
        />

        <EditStudentModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent}
          onUpdate={handleUpdateStudent}
          classes={classes}
          academicYears={academicYears}
        />
      </div>
    </DashboardLayout>
  )
}
