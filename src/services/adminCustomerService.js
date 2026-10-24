import axios from 'axios'

const API_BASE = '/api'

function getAuthHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
    'x-dev-admin': 'true',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

export async function getAdminCustomers(token) {
  try {
    const res = await axios.get(`${API_BASE}/admin/customers`, {
      headers: getAuthHeaders(token),
    })
    return res.data?.data || []
  } catch (err) {
    console.error('Failed to load admin customers:', err)
    return []
  }
}

export async function syncUserProfile({ clerkUserId, email, firstName, lastName, phone, shippingAddress }) {
  if (!clerkUserId || !email) return null

  try {
    const res = await axios.post(`${API_BASE}/users/sync`, {
      clerkUserId,
      email,
      firstName,
      lastName,
      phone,
      shippingAddress,
    })
    return res.data?.profile
  } catch (err) {
    console.error('Failed to sync user profile to Supabase:', err)
    return null
  }
}
