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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
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
  const api = useApi()

  const getStudents = useCallback(async (params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const url = `/api/students${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return api.callApi(url)
  }, [api])

  const createStudent = useCallback(async (studentData: any) => {
    return api.callApi('/api/students', {
      method: 'POST',
      body: studentData
    })
  }, [api])

  const updateStudent = useCallback(async (id: string, studentData: any) => {
    return api.callApi(`/api/students/${id}`, {
      method: 'PUT',
      body: studentData
    })
  }, [api])

  const deleteStudent = useCallback(async (id: string) => {
    return api.callApi(`/api/students/${id}`, {
      method: 'DELETE'
    })
  }, [api])

  const getStudent = useCallback(async (id: string) => {
    return api.callApi(`/api/students/${id}`)
  }, [api])

  return {
    ...api,
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudent
  }
}

export function usePayments() {
  const api = useApi()

  const getPayments = useCallback(async (params?: {
    studentId?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.studentId) searchParams.append('studentId', params.studentId)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())

    const url = `/api/payments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    return api.callApi(url)
  }, [api])

  const createPayment = useCallback(async (paymentData: any) => {
    return api.callApi('/api/payments', {
      method: 'POST',
      body: paymentData
    })
  }, [api])

  return {
    ...api,
    getPayments,
    createPayment
  }
}

export function useFees() {
  const api = useApi()

  const getFeeStructures = useCallback(async () => {
    return api.callApi('/api/fees/structures')
  }, [api])

  const getFeeTypes = useCallback(async () => {
    return api.callApi('/api/fees/types')
  }, [api])

  const createFeeStructure = useCallback(async (feeData: any) => {
    return api.callApi('/api/fees/structures', {
      method: 'POST',
      body: feeData
    })
  }, [api])

  return {
    ...api,
    getFeeStructures,
    getFeeTypes,
    createFeeStructure
  }
}







