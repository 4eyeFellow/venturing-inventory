import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

function Layout({ children }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserMenuOpen(false)
            }
        }

        if (userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [userMenuOpen])

    const navigation = [
        { name: 'Dashboard', path: '/' },
        { name: 'Trips', path: '/trips' },
        { name: 'Lessons', path: '/lessons' },
        { name: 'Vendors', path: '/vendors' },
        { name: 'Equipment', path: '/equipment' },
        { name: 'Checkout History', path: '/checkout-history' },
        ...(user?.role === 'Admin' ? [{ name: 'Users', path: '/users' }] : [])
    ]

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Title */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl">🏕️</span>
                                <span className="ml-2 text-xl font-bold text-gray-900">
                                    UE Venturing Crew Trip Planner
                                </span>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive(item.path)
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center">
                            <div className="relative ml-3" ref={dropdownRef}>
                                <div>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-700 font-medium">{user?.name || 'User'}</span>
                                            <span className={`badge text-white ${user?.role === 'Admin' ? 'bg-red-600' :
                                                    user?.role === 'Leader' ? 'bg-blue-600' :
                                                        'bg-green-600'
                                                }`}>
                                                {user?.role || 'Member'}
                                            </span>
                                            <svg
                                                className="h-5 w-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                </div>

                                {/* Dropdown menu */}
                                {userMenuOpen && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    navigate('/profile')
                                                    setUserMenuOpen(false)
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigate('/profile')
                                                    setUserMenuOpen(false)
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Settings
                                            </button>
                                            <a
                                                href="https://docs.claude.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                Help/Docs
                                            </a>
                                            <div className="border-t border-gray-100"></div>
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    navigate('/login')
                                                    setUserMenuOpen(false)
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-gray-500">
                        © 2025 UE Venturing Crew Trip Planner • Built by Ezekiel Grant • Wood Badge Goal #1
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Layout
