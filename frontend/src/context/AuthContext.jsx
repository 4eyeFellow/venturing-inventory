import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = (userData) => {
        setUser(userData)
        localStorage.setItem('currentUser', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('currentUser')
    }

    const updateProfile = (updates) => {
        const updatedUser = { ...user, ...updates }
        setUser(updatedUser)
        localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }

    // Role-based access control helpers
    const hasRole = (roles) => {
        if (!user) return false
        if (Array.isArray(roles)) {
            return roles.includes(user.role)
        }
        return user.role === roles
    }

    const isAdmin = () => hasRole('Admin')
    const isLeader = () => hasRole(['Admin', 'Leader'])
    const isMember = () => hasRole(['Admin', 'Leader', 'Member'])

    const value = {
        user,
        loading,
        login,
        logout,
        updateProfile,
        hasRole,
        isAdmin,
        isLeader,
        isMember
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
