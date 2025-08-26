"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: StudentFormData) => Promise<void>
  classes: any[]
  academicYears: any[]
}

interface StudentFormData {
  admissionNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string // Changed to string to match API expectations
  gender: 'MALE' | 'FEMALE'
  classId: string
  academicYearId: string
  schoolId: string
  parentName: string
  parentPhone: string
  parentEmail: string
  address: string
  emergencyContact?: string
  medicalConditions?: string
  allergies?: string
}

export default function AddStudentModal({ isOpen, onClose, onSubmit, classes, academicYears }: AddStudentModalProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [formData, setFormData] = useState<StudentFormData>({
    admissionNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: new Date().toISOString().split('T')[0], // Initialize as ISO date string
    gender: 'MALE',
    classId: '',
    academicYearId: '',
    schoolId: 'default',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    emergencyContact: '',
    medicalConditions: '',
    allergies: ''
  })

  const [errors, setErrors] = useState<Partial<StudentFormData>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        admissionNumber: '',
        firstName: '',
        lastName: '',
        middleName: '',
        dateOfBirth: new Date().toISOString().split('T')[0],
        gender: 'MALE',
        classId: '',
        academicYearId: '',
        schoolId: 'default',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        address: '',
        emergencyContact: '',
        medicalConditions: '',
        allergies: ''
      })
      setErrors({})
      setApiError(null)
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentFormData> = {}

    if (!formData.admissionNumber.trim()) {
      newErrors.admissionNumber = 'Admission number is required'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.classId) {
      newErrors.classId = 'Class is required'
    }

    if (!formData.academicYearId) {
      newErrors.academicYearId = 'Academic year is required'
    }

    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Parent name is required'
    }

    if (!formData.parentPhone.trim()) {
      newErrors.parentPhone = 'Parent phone is required'
    }

    if (!formData.parentEmail.trim()) {
      newErrors.parentEmail = 'Parent email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Invalid email format'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setApiError(null)
    
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error adding student:', error)
      setApiError(error instanceof Error ? error.message : 'Failed to add student. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof StudentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null)
    }
  }

  // Convert date to string for form handling
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleInputChange('dateOfBirth', date.toISOString().split('T')[0])
    }
  }

  // Convert string date to Date object for calendar
  const getDateFromString = (dateString: string): Date | undefined => {
    if (!dateString) return undefined
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? undefined : date
  }

  // Don't render until client is ready
  if (!isClient) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Add New Student
          </DialogTitle>
        </DialogHeader>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {apiError}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="admissionNumber">Admission Number *</Label>
                <Input
                  id="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
                  placeholder="e.g., 2024-001"
                  className={cn(errors.admissionNumber && "border-red-500")}
                />
                {errors.admissionNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.admissionNumber}</p>
                )}
              </div>

              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="First name"
                  className={cn(errors.firstName && "border-red-500")}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Last name"
                  className={cn(errors.lastName && "border-red-500")}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  placeholder="Middle name (optional)"
                />
              </div>

              <div>
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOfBirth && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOfBirth ? format(getDateFromString(formData.dateOfBirth) || new Date(), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={getDateFromString(formData.dateOfBirth)}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="class">Class *</Label>
                <Select value={formData.classId} onValueChange={(value) => handleInputChange('classId', value)}>
                  <SelectTrigger className={cn(errors.classId && "border-red-500")}>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && (
                  <p className="text-red-500 text-sm mt-1">{errors.classId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Select value={formData.academicYearId} onValueChange={(value) => handleInputChange('academicYearId', value)}>
                  <SelectTrigger className={cn(errors.academicYearId && "border-red-500")}>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicYearId && (
                  <p className="text-red-500 text-sm mt-1">{errors.academicYearId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Parent/Guardian Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  placeholder="Full name"
                  className={cn(errors.parentName && "border-red-500")}
                />
                {errors.parentName && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="parentPhone">Phone Number *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                  placeholder="+254 700 000 000"
                  className={cn(errors.parentPhone && "border-red-500")}
                />
                {errors.parentPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentPhone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="parentEmail">Email Address *</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                  placeholder="email@example.com"
                  className={cn(errors.parentEmail && "border-red-500")}
                />
                {errors.parentEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address"
                rows={3}
                className={cn(errors.address && "border-red-500")}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="medicalConditions">Medical Conditions</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange('medicalConditions', e.target.value)}
                  placeholder="Any medical conditions (optional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="Any allergies (optional)"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Student...
                </>
              ) : (
                'Add Student'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
