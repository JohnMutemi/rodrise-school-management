"use client"

import { useState, useEffect } from "react"

interface FeeStructureModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (feeStructure: any) => void
  feeStructure?: any
  mode: 'add' | 'edit'
  feeTypes: any[]
  classes: any[]
}

export default function FeeStructureModal({ 
  isOpen, 
  onClose, 
  onSave, 
  feeStructure, 
  mode, 
  feeTypes, 
  classes 
}: FeeStructureModalProps) {
  const [formData, setFormData] = useState({
    feeTypeId: '',
    classId: '',
    academicYear: '',
    term1: 0,
    term2: 0,
    term3: 0,
    isActive: true
  })

  useEffect(() => {
    if (feeStructure && mode === 'edit') {
      setFormData({
        feeTypeId: feeStructure.feeTypeId || '',
        classId: feeStructure.classId || '',
        academicYear: feeStructure.academicYear || '',
        term1: feeStructure.term1 || 0,
        term2: feeStructure.term2 || 0,
        term3: feeStructure.term3 || 0,
        isActive: feeStructure.isActive
      })
    } else {
      setFormData({
        feeTypeId: '',
        classId: '',
        academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
        term1: 0,
        term2: 0,
        term3: 0,
        isActive: true
      })
    }
  }, [feeStructure, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = formData.term1 + formData.term2 + formData.term3
    onSave({ ...formData, total })
    onClose()
  }

  const handleTermChange = (term: string, value: number) => {
    setFormData({ ...formData, [term]: value })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'add' ? 'Add Fee Structure' : 'Edit Fee Structure'}
            </h3>
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
                Fee Type
              </label>
              <select
                value={formData.feeTypeId}
                onChange={(e) => setFormData({ ...formData, feeTypeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Fee Type</option>
                {feeTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 2024-2025"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term 1
                </label>
                <input
                  type="number"
                  value={formData.term1}
                  onChange={(e) => handleTermChange('term1', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term 2
                </label>
                <input
                  type="number"
                  value={formData.term2}
                  onChange={(e) => handleTermChange('term2', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term 3
                </label>
                <input
                  type="number"
                  value={formData.term3}
                  onChange={(e) => handleTermChange('term3', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Total:</span>
                <span className="font-bold text-indigo-600">
                  ${(formData.term1 + formData.term2 + formData.term3).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
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
                {mode === 'add' ? 'Add' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

