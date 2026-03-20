import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../../auth'

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
