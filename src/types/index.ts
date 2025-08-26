export interface Student {
  id: string
  admissionNumber: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth?: string
  gender?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  address?: string
  status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED'
  class?: {
    id: string
    name: string
  }
  school?: {
    id: string
    name: string
  }
  branch?: {
    id: string
    name: string
  }
  academicYear?: {
    id: string
    year: string
  }
  feeBalances: Array<{
    id: string
    amountCharged: string
    amountPaid: string
    balance: string
    feeType: {
      id: string
      name: string
    }
  }>
  feePayments: Array<{
    id: string
    amountPaid: string
    paymentDate: string
    receiptNumber: string
  }>
  feeStatistics?: {
    totalCharged: number
    totalPaid: number
    outstandingBalance: number
    lastPaymentDate: string | null
  }
}

export interface AcademicYear {
  id: string
  year: string
  startDate: string
  endDate: string
  isCurrent: boolean
  isActive: boolean
  schoolId: string
  terms?: Term[]
  _count?: {
    students: number
    feeStructures: number
    feePayments: number
  }
}

export interface Term {
  id: string
  academicYearId: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  order: number
}

export interface Class {
  id: string
  name: string
  level: number
  capacity: number
  isActive: boolean
  schoolId: string
  nextClassId?: string
  _count?: {
    students: number
    feeStructures: number
  }
}

export interface FeeType {
  id: string
  name: string
  description?: string
  isMandatory: boolean
  isRecurring: boolean
  frequency: 'ONCE' | 'TERM' | 'YEAR' | 'MONTH'
  _count?: {
    feeStructures: number
    feeBalances: number
  }
}

export interface FeeStructure {
  id: string
  academicYearId: string
  classId: string
  feeTypeId: string
  amount: string
  term1Amount: string
  term2Amount: string
  term3Amount: string
  isActive: boolean
  academicYear?: AcademicYear
  class?: Class
  feeType?: FeeType
}

export interface FeeBalance {
  id: string
  studentId: string
  academicYearId: string
  termId?: string
  feeTypeId: string
  amountCharged: string
  amountPaid: string
  balance: string
  dueDate?: string
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE'
  student?: Student
  academicYear?: AcademicYear
  term?: Term
  feeType?: FeeType
}

export interface FeePayment {
  id: string
  studentId: string
  academicYearId: string
  termId?: string
  paymentDate: string
  receiptNumber: string
  amountPaid: string
  paymentMethodId?: string
  referenceNumber?: string
  notes?: string
  student?: Student
  academicYear?: AcademicYear
  term?: Term
  paymentMethod?: PaymentMethod
  paymentDetails?: PaymentDetail[]
}

export interface PaymentMethod {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export interface PaymentDetail {
  id: string
  paymentId: string
  feeTypeId: string
  amount: string
  feeType?: FeeType
}

export interface School {
  id: string
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logoUrl?: string
  academicYear: string
}

export interface Branch {
  id: string
  schoolId: string
  name: string
  address?: string
  phone?: string
  email?: string
  isActive: boolean
  school?: School
}



