const AUTH_CHANGED_EVENT = 'auth-changed'

export const getToken = () => localStorage.getItem('token')
export const getUsername = () => localStorage.getItem('username')
export const getRole = () => localStorage.getItem('role')
export const getFullName = () => localStorage.getItem('fullName')
export const getUserId = () => {
  const v = localStorage.getItem('userId')
  return v ? Number(v) : null
}
export const getUserType = () => localStorage.getItem('userType') ?? 'STAFF'
export const isLoggedIn = () => !!getToken()
export const isAdmin = () => ['ADMIN', 'PRINCIPAL'].includes(getRole() ?? '')
export const isStaffUser = () => getUserType() === 'STAFF'

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export const onAuthChanged = (listener: () => void) => {
  window.addEventListener(AUTH_CHANGED_EVENT, listener)
  return () => window.removeEventListener(AUTH_CHANGED_EVENT, listener)
}

export const saveAuth = (
  token: string,
  username: string,
  role: string,
  fullName: string,
  userId?: number | null,
  userType?: string | null
) => {
  localStorage.setItem('token', token)
  localStorage.setItem('username', username)
  localStorage.setItem('role', role)
  localStorage.setItem('fullName', fullName)
  if (userId != null) localStorage.setItem('userId', String(userId))
  if (userType != null) localStorage.setItem('userType', userType)
  notifyAuthChanged()
}

export const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('role')
  localStorage.removeItem('fullName')
  localStorage.removeItem('userId')
  localStorage.removeItem('userType')
  notifyAuthChanged()
}
