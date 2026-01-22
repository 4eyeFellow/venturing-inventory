import axios from 'axios'

// Base URL - will be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // TODO: Add auth token when we implement authentication
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      console.error('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

// ============================================
// TRIP API CALLS
// ============================================

export const tripAPI = {
  // Get all trips with optional filters
  getAll: (filters = {}) => {
    return api.get('/trips', { params: filters })
  },
  
  // Get single trip by ID
  getById: (id) => {
    return api.get(`/trips/${id}`)
  },
  
  // Create new trip
  create: (tripData) => {
    return api.post('/trips', tripData)
  },
  
  // Update trip
  update: (id, tripData) => {
    return api.put(`/trips/${id}`, tripData)
  },
  
  // Delete trip (soft delete)
  delete: (id) => {
    return api.delete(`/trips/${id}`)
  },
  
  // Get trip summary/stats
  getStats: () => {
    return api.get('/trips/stats')
  },
}

// ============================================
// LESSONS LEARNED API CALLS
// ============================================

export const lessonsAPI = {
  // Get all lessons with optional filters
  getAll: (filters = {}) => {
    return api.get('/lessons', { params: filters })
  },
  
  // Get lessons for specific trip
  getByTripId: (tripId) => {
    return api.get(`/trips/${tripId}/lessons`)
  },
  
  // Create new lesson
  create: (lessonData) => {
    return api.post('/lessons', lessonData)
  },
  
  // Update lesson
  update: (id, lessonData) => {
    return api.put(`/lessons/${id}`, lessonData)
  },
  
  // Delete lesson
  delete: (id) => {
    return api.delete(`/lessons/${id}`)
  },
  
  // Upvote lesson
  upvote: (id) => {
    return api.post(`/lessons/${id}/upvote`)
  },
  
  // Search lessons
  search: (query) => {
    return api.get('/lessons/search', { params: { q: query } })
  },
}

// ============================================
// VENDORS API CALLS
// ============================================

export const vendorsAPI = {
  // Get all vendors with optional filters
  getAll: (filters = {}) => {
    return api.get('/vendors', { params: filters })
  },
  
  // Get single vendor by ID
  getById: (id) => {
    return api.get(`/vendors/${id}`)
  },
  
  // Create new vendor
  create: (vendorData) => {
    return api.post('/vendors', vendorData)
  },
  
  // Update vendor
  update: (id, vendorData) => {
    return api.put(`/vendors/${id}`, vendorData)
  },
  
  // Delete vendor
  delete: (id) => {
    return api.delete(`/vendors/${id}`)
  },
  
  // Get vendor performance metrics
  getPerformance: (id) => {
    return api.get(`/vendors/${id}/performance`)
  },
}

// ============================================
// EQUIPMENT API CALLS
// ============================================

export const equipmentAPI = {
  // Get equipment needs for a trip
  getByTripId: (tripId) => {
    return api.get(`/trips/${tripId}/equipment`)
  },
  
  // Check inventory availability (connects to Goal #3 system)
  checkAvailability: (sku, quantity, dateRange) => {
    return api.post('/equipment/check-availability', {
      sku,
      quantity,
      dateRange,
    })
  },
  
  // Add equipment need to trip
  addToTrip: (tripId, equipmentData) => {
    return api.post(`/trips/${tripId}/equipment`, equipmentData)
  },
  
  // Update equipment need
  update: (id, equipmentData) => {
    return api.put(`/equipment/${id}`, equipmentData)
  },
  
  // Delete equipment need
  delete: (id) => {
    return api.delete(`/equipment/${id}`)
  },
}

// ============================================
// TEMPLATES API CALLS
// ============================================

export const templatesAPI = {
  // Get all templates
  getAll: () => {
    return api.get('/templates')
  },
  
  // Get template by ID
  getById: (id) => {
    return api.get(`/templates/${id}`)
  },
  
  // Get template by type
  getByType: (type) => {
    return api.get(`/templates/type/${type}`)
  },
}

// ============================================
// COSTS API CALLS
// ============================================

export const costsAPI = {
  getByTripId: (tripId) => {
    return api.get(`/costs/${tripId}`)
  },
  
  addToTrip: (tripId, costData) => {
    return api.post('/costs', { ...costData, trip_id: tripId })
  },
  
  update: (id, costData) => {
    return api.put(`/costs/${id}`, costData)
  },
  
  delete: (id) => {
    return api.delete(`/costs/${id}`)
  },
  
  getSummary: (tripId) => {
    return api.get(`/costs/${tripId}/summary`)
  },
}

// ============================================
// USERS API CALLS
// ============================================

export const usersAPI = {
  // Get current user
  getCurrent: () => {
    return api.get('/users/me')
  },
  
  // Get all users (admin only)
  getAll: () => {
    return api.get('/users')
  },
  
  // Update user
  update: (id, userData) => {
    return api.put(`/users/${id}`, userData)
  },
}

export default api
