import { useState, useCallback } from 'react'

interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    loading: false,
    error: null
  })

  const callApi = useCallback(async (url: string, options: ApiOptions = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { method = 'GET', headers = {}, body } = options

      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      }

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body)
      }

      const response = await fetch(url, config)

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      setState({ data, loading: false, error: null })
      return data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setState({ data: null, loading: false, error: errorMessage })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    callApi,
    reset
  }
}

// Specific hooks for common operations
export function useStudents() {
  const { data, loading, error, callApi, reset } = useApi()

  const getStudents = useCallback(async (params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
    schoolId?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    searchParams.append('schoolId', params?.schoolId || 'default')

    const url = `/api/students?${searchParams.toString()}`
    return callApi(url)
  }, [callApi])

  const createStudent = useCallback(async (studentData: any) => {
    return callApi('/api/students', {
      method: 'POST',
      body: studentData
    })
  }, [callApi])

  const updateStudent = useCallback(async (id: string, studentData: any) => {
    return callApi(`/api/students?id=${id}`, {
      method: 'PUT',
      body: studentData
    })
  }, [callApi])

  const patchStudent = useCallback(async (id: string, studentData: any) => {
    return callApi(`/api/students?id=${id}`, {
      method: 'PATCH',
      body: studentData
    })
  }, [callApi])

  const deleteStudent = useCallback(async (id: string) => {
    return callApi(`/api/students?id=${id}`, {
      method: 'DELETE'
    })
  }, [callApi])

  const getStudent = useCallback(async (id: string) => {
    return callApi(`/api/students?id=${id}`)
  }, [callApi])

  return {
    data,
    loading,
    error,
    reset,
    getStudents,
    createStudent,
    updateStudent,
    patchStudent,
    deleteStudent,
    getStudent
  }
}

export function usePayments() {
  const { data, loading, error, callApi, reset } = useApi()

  const getPayments = useCallback(async (params?: {
    studentId?: string
    academicYearId?: string
    termId?: string
    paymentMethodId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.studentId) searchParams.append('studentId', params.studentId)
    if (params?.academicYearId) searchParams.append('academicYearId', params.academicYearId)
    if (params?.termId) searchParams.append('termId', params.termId)
    if (params?.paymentMethodId) searchParams.append('paymentMethodId', params.paymentMethodId)
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const url = `/api/payments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return callApi(url)
  }, [callApi])

  const createPayment = useCallback(async (paymentData: any) => {
    return callApi('/api/payments', {
      method: 'POST',
      body: paymentData
    })
  }, [callApi])

  const updatePayment = useCallback(async (id: string, paymentData: any) => {
    return callApi(`/api/payments?id=${id}`, {
      method: 'PUT',
      body: paymentData
    })
  }, [callApi])

  const deletePayment = useCallback(async (id: string) => {
    return callApi(`/api/payments?id=${id}`, {
      method: 'DELETE'
    })
  }, [callApi])

  return {
    data,
    loading,
    error,
    reset,
    getPayments,
    createPayment,
    updatePayment,
    deletePayment
  }
}

export function useFees() {
  const { data, loading, error, callApi, reset } = useApi()

  const getFeeStructures = useCallback(async (params?: {
    academicYearId?: string
    classId?: string
    feeTypeId?: string
    isActive?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.academicYearId) searchParams.append('academicYearId', params.academicYearId)
    if (params?.classId) searchParams.append('classId', params.classId)
    if (params?.feeTypeId) searchParams.append('feeTypeId', params.feeTypeId)
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())

    const url = `/api/fee-structures${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return callApi(url)
  }, [callApi])

  const getFeeTypes = useCallback(async (params?: {
    isActive?: boolean
    frequency?: string
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
    if (params?.frequency) searchParams.append('frequency', params.frequency)

    const url = `/api/fee-types${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return callApi(url)
  }, [callApi])

  const createFeeStructure = useCallback(async (feeData: any) => {
    return callApi('/api/fee-structures', {
      method: 'POST',
      body: feeData
    })
  }, [callApi])

  const updateFeeStructure = useCallback(async (feeData: any) => {
    return callApi('/api/fee-structures', {
      method: 'PUT',
      body: feeData
    })
  }, [callApi])

  const createFeeType = useCallback(async (feeTypeData: any) => {
    return callApi('/api/fee-types', {
      method: 'POST',
      body: feeTypeData
    })
  }, [callApi])

  return {
    data,
    loading,
    error,
    reset,
    getFeeStructures,
    getFeeTypes,
    createFeeStructure,
    updateFeeStructure,
    createFeeType
  }
}

export function useFeeBalances() {
  const { data, loading, error, callApi, reset } = useApi()

  const getFeeBalances = useCallback(async (params?: {
    studentId?: string
    academicYearId?: string
    termId?: string
    feeTypeId?: string
    status?: 'paid' | 'unpaid' | 'partial'
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.studentId) searchParams.append('studentId', params.studentId)
    if (params?.academicYearId) searchParams.append('academicYearId', params.academicYearId)
    if (params?.termId) searchParams.append('termId', params.termId)
    if (params?.feeTypeId) searchParams.append('feeTypeId', params.feeTypeId)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const url = `/api/fee-balances${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return callApi(url)
  }, [callApi])

  const createFeeBalance = useCallback(async (balanceData: any) => {
    return callApi('/api/fee-balances', {
      method: 'POST',
      body: balanceData
    })
  }, [callApi])

  const updateFeeBalance = useCallback(async (id: string, balanceData: any) => {
    return callApi(`/api/fee-balances?id=${id}`, {
      method: 'PUT',
      body: balanceData
    })
  }, [callApi])

  const deleteFeeBalance = useCallback(async (id: string) => {
    return callApi(`/api/fee-balances?id=${id}`, {
      method: 'DELETE'
    })
  }, [callApi])

  return {
    data,
    loading,
    error,
    reset,
    getFeeBalances,
    createFeeBalance,
    updateFeeBalance,
    deleteFeeBalance
  }
}

export function usePaymentMethods() {
  const { data, loading, error, callApi, reset } = useApi()

  const getPaymentMethods = useCallback(async (params?: {
    isActive?: boolean
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())

    const url = `/api/payment-methods${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return callApi(url)
  }, [callApi])

  const createPaymentMethod = useCallback(async (methodData: any) => {
    return callApi('/api/payment-methods', {
      method: 'POST',
      body: methodData
    })
  }, [callApi])

  const updatePaymentMethod = useCallback(async (id: string, methodData: any) => {
    return callApi(`/api/payment-methods?id=${id}`, {
      method: 'PUT',
      body: methodData
    })
  }, [callApi])

  const deletePaymentMethod = useCallback(async (id: string) => {
    return callApi(`/api/payment-methods?id=${id}`, {
      method: 'DELETE'
    })
  }, [callApi])

  return {
    data,
    loading,
    error,
    reset,
    getPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  }
}







