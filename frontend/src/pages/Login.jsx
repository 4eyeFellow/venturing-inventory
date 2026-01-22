import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            // Call real login API
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (data.success) {
                // Login successful
                login({
                    id: data.data.user_id,
                    name: data.data.name,
                    email: data.data.email,
                    role: data.data.role,
                    phone: data.data.phone,
                    bio: data.data.bio,
                    joinDate: data.data.join_date
                })
                navigate('/')
            } else {
                setError(data.error || 'Invalid email or password')
                setLoading(false)
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Failed to connect to server')
            setLoading(false)
        }
    }

    const handleDemoLogin = (account) => {
        setFormData({
            email: account.email,
            password: account.password
        })
        // Auto-submit after setting demo credentials
        setTimeout(() => {
            const event = { preventDefault: () => {} }
            handleSubmit(event)
        }, 100)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🏕️</div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        UE Venturing Crew
                    </h1>
                    <p className="text-gray-600">Trip Planning System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                            <p className="text-red-900 text-sm font-semibold">⚠️ {error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="your.email@ue.edu"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-lg"
                        >
                            {loading ? '⏳ Signing In...' : '→ Sign In'}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3 font-semibold">Demo Accounts:</p>
                        <div className="space-y-2">
                            <div className="text-left px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">Ezekiel Grant</p>
                                        <p className="text-xs text-gray-600">zgrant4056@gmail.com / admin123</p>
                                    </div>
                                    <span className="badge bg-red-100 text-red-800">Admin</span>
                                </div>
                            </div>
                            <div className="text-left px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">Sarah Johnson</p>
                                        <p className="text-xs text-gray-600">leader@ue.edu / leader123</p>
                                    </div>
                                    <span className="badge bg-blue-100 text-blue-800">Leader</span>
                                </div>
                            </div>
                            <div className="text-left px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">Alex Thompson</p>
                                        <p className="text-xs text-gray-600">member@ue.edu / member123</p>
                                    </div>
                                    <span className="badge bg-green-100 text-green-800">Member</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Wood Badge Goal #1 • Built by Ezekiel Grant
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
