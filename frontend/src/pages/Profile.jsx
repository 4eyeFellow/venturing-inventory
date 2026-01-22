import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Profile() {
    const navigate = useNavigate()
    const { user, updateProfile } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    // User data - initialized from auth context
    const [userData, setUserData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        joinDate: user?.joinDate || '2022-09-01'
    })

    // Preferences
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        tripReminders: true,
        weeklyDigest: false,
        theme: 'light',
        dateFormat: 'MM/DD/YYYY',
        defaultView: 'Dashboard'
    })

    // Statistics (these would come from backend)
    const stats = {
        tripsPlanned: 12,
        tripsCompleted: 8,
        lessonsShared: 15,
        memberSince: 'September 2022'
    }

    const handleProfileSave = (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        // Update auth context with new data
        setTimeout(() => {
            updateProfile(userData)
            setSaving(false)
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
            setTimeout(() => setMessage(null), 3000)
        }, 1000)
    }

    const handlePreferencesSave = (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)

        // Simulate API call
        setTimeout(() => {
            setSaving(false)
            setMessage({ type: 'success', text: 'Preferences saved successfully!' })
            setTimeout(() => setMessage(null), 3000)
        }, 1000)
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setMessage(null)

        // Validate passwords match
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' })
            return
        }

        // Validate password strength
        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
            return
        }

        setSaving(true)

        // Use user_id from user object, fallback to id
        const userId = user.user_id || user.id

        try {
            const response = await fetch(`${API_URL}/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            })

            const data = await response.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully!' })
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update password' })
            }
        } catch (err) {
            console.error('Password change error:', err)
            setMessage({ type: 'error', text: 'Failed to connect to server' })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage(null), 5000)
        }
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'security', label: 'Security', icon: '🔒' },
        { id: 'preferences', label: 'Preferences', icon: '⚙️' },
        { id: 'stats', label: 'Statistics', icon: '📊' },
        { id: 'about', label: 'About', icon: 'ℹ️' }
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                    <p className="mt-1 text-gray-600">Manage your account settings and preferences</p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="btn-secondary"
                >
                    ← Back to Dashboard
                </button>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`rounded-lg p-4 ${
                    message.type === 'success' ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                }`}>
                    <p className={`font-semibold ${
                        message.type === 'success' ? 'text-green-900' : 'text-red-900'
                    }`}>
                        {message.type === 'success' ? '✓' : '⚠️'} {message.text}
                    </p>
                </div>
            )}

            {/* Profile Card with Avatar */}
            <div className="card">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                        <p className="text-gray-600">{userData.role}</p>
                        <p className="text-sm text-gray-500 mt-1">{userData.email}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-semibold text-gray-900">{stats.memberSince}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span className="mr-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSave} className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={userData.name}
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={userData.email}
                                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role/Position
                                </label>
                                <input
                                    type="text"
                                    value={userData.role}
                                    onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={userData.phone}
                                    onChange={(e) => {
                                        const formatted = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        const display = formatted.length <= 3 ? formatted :
                                                       formatted.length <= 6 ? `(${formatted.slice(0,3)}) ${formatted.slice(3)}` :
                                                       `(${formatted.slice(0,3)}) ${formatted.slice(3,6)}-${formatted.slice(6)}`;
                                        setUserData({ ...userData, phone: display });
                                    }}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                value={userData.bio}
                                onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                                rows="4"
                                placeholder="Tell us about yourself..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving ? '⏳ Saving...' : '✓ Save Profile'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordChange} className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>

                        <div className="space-y-4">
                            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                <h3 className="font-semibold text-yellow-900 mb-1">Change Password</h3>
                                <p className="text-sm text-yellow-800">
                                    Password must be at least 8 characters long
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password *
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password *
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    required
                                    minLength={8}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                                    <p className="text-sm text-red-600 mt-1">Password must be at least 8 characters</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password *
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                    <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                className="btn-primary"
                            >
                                {saving ? '⏳ Updating...' : '🔒 Change Password'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                    <form onSubmit={handlePreferencesSave} className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Preferences</h2>

                        {/* Notifications */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Notifications</h3>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={preferences.emailNotifications}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            emailNotifications: e.target.checked
                                        })}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Email notifications for new trips and updates
                                    </span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={preferences.tripReminders}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            tripReminders: e.target.checked
                                        })}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Reminders for upcoming trips (24 hours before)
                                    </span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={preferences.weeklyDigest}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            weeklyDigest: e.target.checked
                                        })}
                                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">
                                        Weekly digest email with crew activity summary
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Display Settings */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Display Settings</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Theme
                                    </label>
                                    <select
                                        value={preferences.theme}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            theme: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                        <option value="auto">Auto (System)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date Format
                                    </label>
                                    <select
                                        value={preferences.dateFormat}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            dateFormat: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Default Landing Page
                                    </label>
                                    <select
                                        value={preferences.defaultView}
                                        onChange={(e) => setPreferences({
                                            ...preferences,
                                            defaultView: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="Dashboard">Dashboard</option>
                                        <option value="Trips">Trip List</option>
                                        <option value="Calendar">Calendar View</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving ? '⏳ Saving...' : '✓ Save Preferences'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Statistics</h2>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="text-center p-6 bg-blue-50 rounded-lg">
                                    <div className="text-4xl font-bold text-blue-600">{stats.tripsPlanned}</div>
                                    <p className="text-sm text-gray-600 mt-2">Trips Planned</p>
                                </div>

                                <div className="text-center p-6 bg-green-50 rounded-lg">
                                    <div className="text-4xl font-bold text-green-600">{stats.tripsCompleted}</div>
                                    <p className="text-sm text-gray-600 mt-2">Trips Completed</p>
                                </div>

                                <div className="text-center p-6 bg-yellow-50 rounded-lg">
                                    <div className="text-4xl font-bold text-yellow-600">{stats.lessonsShared}</div>
                                    <p className="text-sm text-gray-600 mt-2">Lessons Shared</p>
                                </div>

                                <div className="text-center p-6 bg-purple-50 rounded-lg">
                                    <div className="text-4xl font-bold text-purple-600">
                                        {Math.round((stats.tripsCompleted / stats.tripsPlanned) * 100)}%
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">Completion Rate</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-gray-700">✓ Completed Cates Farm trip</span>
                                    <span className="text-xs text-gray-500">2 days ago</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-gray-700">📝 Added 3 lessons learned</span>
                                    <span className="text-xs text-gray-500">1 week ago</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm text-gray-700">🗓️ Created Fall Break Trip</span>
                                    <span className="text-xs text-gray-500">2 weeks ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="card space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">About This System</h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">UE Venturing Crew Trip Planner</h3>
                                <p className="text-gray-700">
                                    A comprehensive trip planning and management system designed for the University of Evansville Venturing Crew.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Wood Badge Goal #1</h3>
                                <p className="text-gray-700">
                                    This system was created as part of Ezekiel Grant's Wood Badge certification project to streamline
                                    trip planning, improve documentation, and preserve institutional knowledge for future crew leaders.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mt-6">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Version</h4>
                                    <p className="text-gray-700">1.0.0</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
                                    <p className="text-gray-700">January 2026</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Developer</h4>
                                    <p className="text-gray-700">Ezekiel Grant</p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-2">Support</h4>
                                    <p className="text-gray-700">zgrant4056@gmail.com</p>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-2">🏆 Wood Badge Certification</h4>
                                <p className="text-sm text-green-800">
                                    Target Completion: March 28, 2027<br />
                                    Ticket Counselor: Katrina Marshall
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
