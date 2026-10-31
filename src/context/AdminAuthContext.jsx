import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const AdminAuthContext = createContext(null)

const TOKEN_KEY = 'atelier_admin_token'

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [isLoading, setIsLoading] = useState(true)

  // Verify stored session on app mount
  useEffect(() => {
    let isMounted = true

    async function verifySession() {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      if (!savedToken) {
        if (isMounted) {
          setAdmin(null)
          setToken(null)
          setIsLoading(false)
        }
        return
      }

      try {
        const res = await axios.get('/api/admin/auth/me', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        })

        if (isMounted && res.data?.success && res.data?.admin) {
          setAdmin(res.data.admin)
          setToken(savedToken)
        } else {
          throw new Error('Invalid session response')
        }
      } catch (err) {
        console.warn('[AdminAuth] Stored session invalid or expired:', err?.response?.data?.error || err.message)
        localStorage.removeItem(TOKEN_KEY)
        if (isMounted) {
          setAdmin(null)
          setToken(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    verifySession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await axios.post('/api/admin/auth/login', {
        email,
        password,
      })

      if (res.data?.success && res.data?.token) {
        const authToken = res.data.token
        const adminData = res.data.admin
        localStorage.setItem(TOKEN_KEY, authToken)
        setToken(authToken)
        setAdmin(adminData)
        return { success: true, admin: adminData }
      }

      return {
        success: false,
        error: res.data?.error || 'Authentication failed.',
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to connect to authentication server.'
      return { success: false, error: errorMessage }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem(TOKEN_KEY)
      if (currentToken) {
        await axios.post(
          '/api/admin/auth/logout',
          {},
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        )
      }
    } catch {
      // Continue client-side cleanup regardless of API response
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setAdmin(null)
    }
  }, [])

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: Boolean(admin && token),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export default AdminAuthContext

