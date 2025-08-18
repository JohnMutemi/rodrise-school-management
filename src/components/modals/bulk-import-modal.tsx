"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: StudentImportData[]) => Promise<void>
}

interface StudentImportData {
  admissionNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE'
  className: string
  parentName: string
  parentPhone: string
  parentEmail: string
  address: string
  emergencyContact?: string
  medicalConditions?: string
  allergies?: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export default function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [importData, setImportData] = useState<StudentImportData[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'import'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateStudentData = (data: StudentImportData): ValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // Required field validation
    if (!data.admissionNumber?.trim()) {
      errors.push('Admission number is required')
    }

    if (!data.firstName?.trim()) {
      errors.push('First name is required')
    }

    if (!data.lastName?.trim()) {
      errors.push('Last name is required')
    }

    if (!data.className?.trim()) {
      errors.push('Class is required')
    }

    if (!data.parentName?.trim()) {
      errors.push('Parent name is required')
    }

    if (!data.parentPhone?.trim()) {
      errors.push('Parent phone is required')
    }

    if (!data.parentEmail?.trim()) {
      errors.push('Parent email is required')
    } else if (!/\S+@\S+\.\S+/.test(data.parentEmail)) {
      errors.push('Invalid email format')
    }

    if (!data.address?.trim()) {
      errors.push('Address is required')
    }

    // Date validation
    if (data.dateOfBirth) {
      const date = new Date(data.dateOfBirth)
      if (isNaN(date.getTime())) {
        errors.push('Invalid date of birth format')
      }
    }

    // Gender validation
    if (data.gender && !['MALE', 'FEMALE'].includes(data.gender)) {
      errors.push('Gender must be MALE or FEMALE')
    }

    // Phone number validation (basic)
    if (data.parentPhone && !/^[\+]?[0-9\s\-\(\)]+$/.test(data.parentPhone)) {
      warnings.push('Phone number format may be invalid')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const data: StudentImportData[] = []
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          data.push(row as StudentImportData)
        }
      }

      setImportData(data)
      
      // Validate all rows
      const results = data.map(validateStudentData)
      setValidationResults(results)
      
      setCurrentStep('preview')
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setIsLoading(true)
    try {
      // Filter out invalid rows
      const validData = importData.filter((_, index) => validationResults[index]?.isValid)
      await onImport(validData)
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error importing students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setImportData([])
    setValidationResults([])
    setCurrentStep('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const template = `admissionNumber,firstName,lastName,middleName,dateOfBirth,gender,className,parentName,parentPhone,parentEmail,address,emergencyContact,medicalConditions,allergies
2024-001,John,Doe,Michael,2013-03-15,MALE,Grade 1A,Jane Doe,+254 700 123 457,jane.doe@email.com,"123 Main Street, Nairobi",+254 700 123 458,"None","None"
2024-002,Sarah,Smith,,2012-07-22,FEMALE,Grade 2A,Mike Smith,+254 700 234 568,mike.smith@email.com,"456 Oak Avenue, Nairobi",+254 700 234 569,"Asthma","Peanuts"`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const validCount = validationResults.filter(r => r.isValid).length
  const invalidCount = validationResults.filter(r => !r.isValid).length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Bulk Import Students
          </DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2",
              currentStep === 'upload' ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"
            )}>
              1
            </div>
            <div className={cn(
              "w-16 h-1",
              currentStep === 'preview' || currentStep === 'import' ? "bg-blue-600" : "bg-gray-300"
            )} />
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2",
              currentStep === 'preview' || currentStep === 'import' ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"
            )}>
              2
            </div>
            <div className={cn(
              "w-16 h-1",
              currentStep === 'import' ? "bg-blue-600" : "bg-gray-300"
            )} />
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2",
              currentStep === 'import' ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-500"
            )}>
              3
            </div>
          </div>
        </div>

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Upload a CSV file with student information. Make sure your file follows the required format.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Click to upload
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                CSV files only, max 10MB
              </p>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Preview Data</h3>
                <p className="text-sm text-gray-600">
                  Review the data before importing. {validCount} valid, {invalidCount} invalid records.
                </p>
              </div>
              <div className="flex space-x-2">
                <Badge variant={validCount > 0 ? "default" : "secondary"}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validCount} Valid
                </Badge>
                <Badge variant={invalidCount > 0 ? "destructive" : "secondary"}>
                  <XCircle className="h-3 w-3 mr-1" />
                  {invalidCount} Invalid
                </Badge>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Admission #</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importData.map((student, index) => {
                    const validation = validationResults[index]
                    return (
                      <TableRow key={index} className={cn(
                        !validation?.isValid && "bg-red-50"
                      )}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                          {student.middleName && ` ${student.middleName}`}
                        </TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.parentName}</div>
                            <div className="text-sm text-gray-500">{student.parentPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {validation?.isValid ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Invalid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {validation?.errors.length > 0 && (
                            <div className="text-sm text-red-600">
                              {validation.errors.slice(0, 2).join(', ')}
                              {validation.errors.length > 2 && ` +${validation.errors.length - 2} more`}
                            </div>
                          )}
                          {validation?.warnings.length > 0 && (
                            <div className="text-sm text-yellow-600">
                              {validation.warnings.slice(0, 1).join(', ')}
                              {validation.warnings.length > 1 && ` +${validation.warnings.length - 1} more`}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('upload')}
              >
                Back to Upload
              </Button>
              <Button
                type="button"
                onClick={() => setCurrentStep('import')}
                disabled={validCount === 0}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Continue to Import
              </Button>
            </div>
          </div>
        )}

        {/* Import Step */}
        {currentStep === 'import' && (
          <div className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are about to import {validCount} students. This action cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Import Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Records:</span>
                  <span className="ml-2 font-medium">{importData.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Valid Records:</span>
                  <span className="ml-2 font-medium text-green-600">{validCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Invalid Records:</span>
                  <span className="ml-2 font-medium text-red-600">{invalidCount}</span>
                </div>
                <div>
                  <span className="text-gray-600">Will be Imported:</span>
                  <span className="ml-2 font-medium text-blue-600">{validCount}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('preview')}
              >
                Back to Preview
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={isLoading || validCount === 0}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${validCount} Students`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

