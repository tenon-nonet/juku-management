import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface PrivateRouteProps {
  children: React.ReactNode
  roles?: string[]
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0 && user) {
    const hasRequiredRole = roles.includes(user.role) || roles.includes(user.userType)
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
