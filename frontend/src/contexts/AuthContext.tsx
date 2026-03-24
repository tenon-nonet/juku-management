import { createContext, useContext, useEffect, useState } from 'react'
import {
  getToken, getUsername, getRole, getFullName, getUserId, getUserType,
  saveAuth, clearAuth, onAuthChanged
} from '../auth'

export type UserRole = 'PRINCIPAL' | 'ADMIN' | 'TEACHER' | 'OFFICE_STAFF' | 'STAFF' | 'STUDENT' | 'GUARDIAN'
export type UserType = 'STAFF' | 'STUDENT' | 'GUARDIAN'

interface AuthUser {
  token: string
  username: string
  role: UserRole
  fullName: string
  userId: number | null
  userType: UserType
}

interface AuthContextValue {
  user: AuthUser | null
  isLoggedIn: boolean
  login: (token: string, username: string, role: string, fullName: string, userId?: number | null, userType?: string | null) => void
  logout: () => void
  hasRole: (...roles: string[]) => boolean
  isAdmin: () => boolean
  isStaff: () => boolean
  isStudent: () => boolean
  isGuardian: () => boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  isAdmin: () => false,
  isStaff: () => false,
  isStudent: () => false,
  isGuardian: () => false,
})

function buildUser(): AuthUser | null {
  const token = getToken()
  if (!token) return null
  return {
    token,
    username: getUsername() ?? '',
    role: (getRole() ?? 'STAFF') as UserRole,
    fullName: getFullName() ?? '',
    userId: getUserId(),
    userType: (getUserType() ?? 'STAFF') as UserType,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(buildUser)

  useEffect(() => {
    const unsub = onAuthChanged(() => setUser(buildUser()))
    return unsub
  }, [])

  const login = (token: string, username: string, role: string, fullName: string, userId?: number | null, userType?: string | null) => {
    saveAuth(token, username, role, fullName, userId, userType)
    setUser(buildUser())
  }

  const logout = () => {
    clearAuth()
    setUser(null)
  }

  const hasRole = (...roles: string[]) => roles.includes(user?.role ?? '')
  const isAdminFn = () => ['ADMIN', 'PRINCIPAL'].includes(user?.role ?? '')
  const isStaffFn = () => user?.userType === 'STAFF'
  const isStudentFn = () => user?.userType === 'STUDENT'
  const isGuardianFn = () => user?.userType === 'GUARDIAN'

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      logout,
      hasRole,
      isAdmin: isAdminFn,
      isStaff: isStaffFn,
      isStudent: isStudentFn,
      isGuardian: isGuardianFn,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
