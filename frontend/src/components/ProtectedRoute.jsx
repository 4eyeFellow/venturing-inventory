import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, requiredRole }) {
    const { user, hasRole } = useAuth()

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Logged in but doesn't have required role - show access denied
    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="max-w-2xl mx-auto mt-20">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
                    <p className="text-red-700 mb-6">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-red-600 mb-4">
                        Required role: <span className="font-semibold">{Array.isArray(requiredRole) ? requiredRole.join(', ') : requiredRole}</span>
                        <br />
                        Your role: <span className="font-semibold">{user.role}</span>
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="btn-secondary"
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        )
    }

    // Has permission - render the protected content
    return children
}

export default ProtectedRoute
