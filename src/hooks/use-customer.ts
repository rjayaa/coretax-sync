// src/hooks/use-customer.ts
import { useQuery } from '@tanstack/react-query'

interface Customer {
  id: string
  nama: string
  npwp: string
  jalan: string | null
  alamatLengkap: string
}

interface CustomerResponse {
  customers: Customer[]
}

interface SingleCustomerResponse {
  data: Customer
}

// Hook untuk mendapatkan daftar customers
export function useCustomers() {
  return useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await fetch('/api/customers')
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      return data.customers
    }
  })
}

// Hook untuk mendapatkan single customer by ID
export function useCustomer(id: string | null) {
  return useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) throw new Error('Customer ID is required')
      
      const response = await fetch(`/api/customers/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customer')
      }
      const data: SingleCustomerResponse = await response.json()
      return data.data
    },
    enabled: !!id // Query hanya dijalankan jika ada ID
  })
}

// Hook untuk mencari customers berdasarkan search term
export function useCustomerSearch(searchTerm: string) {
  return useQuery<Customer[]>({
    queryKey: ['customers', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 3) return []
      
      const response = await fetch(`/api/customers?search=${encodeURIComponent(searchTerm)}`)
      if (!response.ok) {
        throw new Error('Failed to search customers')
      }
      const data = await response.json()
      return data.customers
    },
    enabled: searchTerm.length >= 3 // Hanya search jika minimal 3 karakter
  })
}

export type { Customer }