"use client"

import { useState, useEffect } from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payment: any) => void
  students: any[]
  feeTypes: any[]
  feeStructures: any[]
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  students, 
  feeTypes, 
  feeStructures 
}: PaymentModalProps) {
  const [formData, setFormData] = useState({
    studentId: '',
    feeTypeId: '',
    term: '',
    amount: 0,
    paymentMethod: 'Cash',
    referenceNumber: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0]
  })

  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [availableFees, setAvailableFees] = useState<any[]>([])

  // Mock students and fee types for demonstration
  const mockStudents = [
    { id: '1', name: 'John Doe', studentId: 'STU001', class: 'Grade 10A' },
    { id: '2', name: 'Sarah Smith', studentId: 'STU002', class: 'Grade 9B' },
    { id: '3', name: 'Mike Johnson', studentId: 'STU003', class: 'Grade 11A' }
  ]

  const mockFeeTypes = [
    { id: '1', name: 'Tuition Fee' },
    { id: '2', name: 'Library Fee' },
    { id: '3', name: 'Laboratory Fee' },
    { id: '4', name: 'Sports Fee' }
  ]

  const mockFeeStructures = [
    { id: '1', feeTypeId: '1', class: 'Grade 10A', term1: 500, term2: 500, term3: 500 },
    { id: '2', feeTypeId: '2', class: 'Grade 10A', term1: 50, term2: 50, term3: 50 },
    { id: '3', feeTypeId: '3', class: 'Grade 11A', term1: 100, term2: 100, term3: 100 }
  ]

  useEffect(() => {
    if (formData.studentId) {
      const student = mockStudents.find(s => s.id === formData.studentId)
      setSelectedStudent(student)
      
      // Filter fee structures based on student's class
      if (student) {
        const studentFees = mockFeeStructures.filter(fs => fs.class === student.class)
        setAvailableFees(studentFees)
      }
    }
  }, [formData.studentId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Generate receipt number
    const receiptNumber = `RCP${Date.now().toString().slice(-6)}`
    
    const paymentData = {
      ...formData,
      receiptNumber,
      studentName: selectedStudent?.name,
      studentId: selectedStudent?.studentId,
      feeType: mockFeeTypes.find(ft => ft.id === formData.feeTypeId)?.name
    }
    
    onSave(paymentData)
    onClose()
  }

  const getTermAmount = () => {
    if (!formData.feeTypeId || !formData.term || !selectedStudent) return 0
    
    const feeStructure = availableFees.find(fs => fs.feeTypeId === formData.feeTypeId)
    if (!feeStructure) return 0
    
    switch (formData.term) {
      case 'Term 1': return feeStructure.term1
      case 'Term 2': return feeStructure.term2
      case 'Term 3': return feeStructure.term3
      default: return 0
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Record Payment</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Student</option>
                {mockStudents.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.studentId}) - {student.class}
                  </option>
                ))}
              </select>
            </div>

            {selectedStudent && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedStudent.name} - {selectedStudent.class}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee Type
              </label>
              <select
                value={formData.feeTypeId}
                onChange={(e) => setFormData({ ...formData, feeTypeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Fee Type</option>
                {availableFees.map((fee) => {
                  const feeType = mockFeeTypes.find(ft => ft.id === fee.feeTypeId)
                  return (
                    <option key={fee.id} value={fee.feeTypeId}>
                      {feeType?.name}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term
              </label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Term</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount || getTermAmount()}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
                step="0.01"
                required
              />
              {getTermAmount() > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Standard amount: ${getTermAmount().toFixed(2)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Transaction reference (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Additional notes (optional)"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

