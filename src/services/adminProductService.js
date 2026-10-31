import axios from 'axios'

const API_BASE = '/api/admin'

function getAuthHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    'x-dev-admin': 'true', // Allows local development authorization
  }
  const resolvedToken =
    token || (typeof window !== 'undefined' ? localStorage.getItem('atelier_admin_token') : null)
  if (resolvedToken) {
    headers['Authorization'] = `Bearer ${resolvedToken}`
  }
  return headers
}

export async function getAdminProducts({ search, categoryId, brandId, isActive, sortBy, sortDir, token } = {}) {
  const params = {}
  if (search) params.search = search
  if (categoryId) params.categoryId = categoryId
  if (brandId) params.brandId = brandId
  if (isActive !== undefined) params.isActive = isActive
  if (sortBy) params.sortBy = sortBy
  if (sortDir) params.sortDir = sortDir

  const res = await axios.get(`${API_BASE}/products`, {
    params,
    headers: getAuthHeaders(token),
  })
  return res.data?.data || []
}

export async function getAdminProductById(id, token) {
  const res = await axios.get(`${API_BASE}/products/${id}`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function createAdminProduct(productData, token) {
  const res = await axios.post(`${API_BASE}/products`, productData, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function updateAdminProduct(id, updates, token) {
  const res = await axios.patch(`${API_BASE}/products/${id}`, updates, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function deleteAdminProduct(id, { soft = false, token } = {}) {
  const res = await axios.delete(`${API_BASE}/products/${id}?soft=${soft}`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function updateAdminStock(id, stockQuantity, token) {
  const res = await axios.patch(
    `${API_BASE}/products/${id}/stock`,
    { stockQuantity },
    { headers: getAuthHeaders(token) }
  )
  return res.data?.data
}

// ─── Categories ──────────────────────────────────────────────────
export async function getAdminCategories(token) {
  const res = await axios.get(`${API_BASE}/categories`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data || []
}

export async function getAdminCategoryById(id, token) {
  const res = await axios.get(`${API_BASE}/categories/${id}`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function createAdminCategory(categoryData, token) {
  const res = await axios.post(`${API_BASE}/categories`, categoryData, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function updateAdminCategory(id, updates, token) {
  const res = await axios.patch(`${API_BASE}/categories/${id}`, updates, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function deleteAdminCategory(id, token) {
  const res = await axios.delete(`${API_BASE}/categories/${id}`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

// ─── Brands ──────────────────────────────────────────────────────
export async function getAdminBrands(token) {
  const res = await axios.get(`${API_BASE}/brands`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data || []
}

export async function getAdminBrandById(id, token) {
  const res = await axios.get(`${API_BASE}/brands/${id}`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function createAdminBrand(brandData, token) {
  const res = await axios.post(`${API_BASE}/brands`, brandData, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function updateAdminBrand(id, updates, token) {
  const res = await axios.patch(`${API_BASE}/brands/${id}`, updates, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function deleteAdminBrand(id, token) {
  const res = await axios.delete(`${API_BASE}/brands/${id}`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

// ─── Orders (Admin) ──────────────────────────────────────────────
export async function getAdminOrders({ search, status, sortBy, sortDir, token } = {}) {
  const params = {}
  if (search) params.search = search
  if (status && status !== 'all') params.status = status
  if (sortBy) params.sortBy = sortBy
  if (sortDir) params.sortDir = sortDir

  const res = await axios.get(`${API_BASE}/orders`, {
    params,
    headers: getAuthHeaders(token),
  })
  return res.data?.data || []
}

export async function getAdminOrderById(id, token) {
  const res = await axios.get(`${API_BASE}/orders/${id}`, {
    headers: getAuthHeaders(token),
  })
  return res.data?.data
}

export async function patchOrderStatus(id, status, token) {
  const res = await axios.patch(
    `${API_BASE}/orders/${id}/status`,
    { status },
    { headers: getAuthHeaders(token) }
  )
  return res.data?.data
}

// ─── Orders (Customer) ───────────────────────────────────────────
export async function getCustomerOrders(clerkUserId, token) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (clerkUserId) headers['x-clerk-user-id'] = clerkUserId
  headers['Content-Type'] = 'application/json'

  const res = await axios.get('/api/orders', { headers })
  return res.data?.data || []
}

// ─── Coupons ─────────────────────────────────────────────────────
export async function validateCouponCode(code) {
  const res = await axios.post('/api/coupons/validate', { code })
  return res.data // { valid, discount_type, discount_value, ... }
}
