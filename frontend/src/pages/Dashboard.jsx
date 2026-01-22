import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { tripAPI, lessonsAPI } from '../services/api'

function Dashboard() {
    const [stats, setStats] = useState({
        totalTrips: 0,
        upcomingTrips: 0,
        completedTrips: 0,
        avgCost: 0
    })

    const [upcomingTrips, setUpcomingTrips] = useState([])
    const [recentActivity, setRecentActivity] = useState([])
    const [criticalLessons, setCriticalLessons] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true)

                // Fetch trip statistics
                const statsResponse = await tripAPI.getStats()
                console.log('Stats response:', statsResponse.data)

                if (statsResponse.data.success) {
                    const statsData = statsResponse.data.data
                    setStats({
                        totalTrips: parseInt(statsData.total_trips) || 0,
                        upcomingTrips: parseInt(statsData.upcoming_trips) || 0,
                        completedTrips: parseInt(statsData.completed_trips) || 0,
                        avgCost: parseFloat(statsData.avg_cost) || 0
                    })
                }

                // Fetch upcoming trips (Planned or In Progress status)
                const tripsResponse = await tripAPI.getAll({
                    status: 'Planned',
                    limit: 5
                })
                console.log('Trips response:', tripsResponse.data)

                if (tripsResponse.data.success && tripsResponse.data.data) {
                    const trips = tripsResponse.data.data.map(trip => ({
                        id: trip.trip_id,
                        name: trip.trip_name,
                        icon: getTripIcon(trip.trip_type),
                        dates: formatDateRange(trip.start_date, trip.end_date),
                        status: trip.trip_status
                    }))
                    setUpcomingTrips(trips)
                }

                // Fetch critical lessons
                const lessonsResponse = await lessonsAPI.getAll({
                    priority: 'Critical',
                    limit: 5
                })
                console.log('Lessons response:', lessonsResponse.data)

                if (lessonsResponse.data.success && lessonsResponse.data.data) {
                    const lessons = lessonsResponse.data.data.map(lesson => ({
                        id: lesson.lesson_id,
                        title: lesson.lesson_title,
                        trip: lesson.trip_name || 'Unknown Trip',
                        category: lesson.lesson_category
                    }))
                    setCriticalLessons(lessons)
                }

                // TODO: Fetch recent activity from activity log when implemented
                setRecentActivity([
                    {
                        id: 1,
                        type: 'info',
                        message: 'System connected to database successfully',
                        time: 'Just now'
                    }
                ])

                setLoading(false)
            } catch (err) {
                console.error('Error fetching dashboard data:', err)
                setError(err.message)
                setLoading(false)

                // Set mock data as fallback
                setStats({
                    totalTrips: 0,
                    upcomingTrips: 0,
                    completedTrips: 0,
                    avgCost: 0
                })
                setRecentActivity([
                    {
                        id: 1,
                        type: 'error',
                        message: 'Could not connect to API. Make sure backend is running on port 5000.',
                        time: 'Just now'
                    }
                ])
            }
        }

        fetchDashboardData()
    }, [])

    // Helper function to get emoji icon based on trip type
    const getTripIcon = (tripType) => {
        const icons = {
            'Spring Break Trip': '🏔️',
            'Fall Break Trip': '🍂',
            'Day of Service Event': '🌳',
            'Same Day Reward Event': '🎉',
            'Vertical Escape Trip': '🧗',
            'Day Trip': '🥾',
            'International Trip': '✈️'
        }
        return icons[tripType] || '🏕️'
    }

    // Helper function to format date range
    const formatDateRange = (startDate, endDate) => {
        if (!startDate) return 'Date TBD'

        const start = new Date(startDate)
        const end = endDate ? new Date(endDate) : null

        const options = { month: 'short', day: 'numeric', year: 'numeric' }

        if (end && start.getTime() !== end.getTime()) {
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.toLocaleDateString('en-US', options)}`
        }

        return start.toLocaleDateString('en-US', options)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-1 text-gray-600">
                    Welcome back, Zeke! Here's your trip planning overview.
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">⚠️</span>
                        <div>
                            <h3 className="font-semibold text-red-900">Connection Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                            <p className="text-sm text-red-600 mt-2">
                                Make sure your backend API is running on port 5000. Run: <code className="bg-red-100 px-2 py-1 rounded">npm run dev</code> in the trip-planner-api folder.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Trips</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalTrips}</p>
                        </div>
                        <div className="text-4xl">📊</div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Upcoming</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.upcomingTrips}</p>
                        </div>
                        <div className="text-4xl">🔜</div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completedTrips}</p>
                        </div>
                        <div className="text-4xl">✓</div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Cost</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {stats.avgCost > 0 ? `$${Math.round(stats.avgCost)}` : '$0'}
                            </p>
                        </div>
                        <div className="text-4xl">💰</div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Trips */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Trips</h2>
                    {upcomingTrips.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No upcoming trips yet</p>
                            <Link to="/trips/create" className="btn-primary inline-block">
                                ➕ Create Your First Trip
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingTrips.map((trip) => (
                                <div key={trip.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl">{trip.icon}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{trip.name}</h3>
                                                <p className="text-sm text-gray-600">{trip.dates}</p>
                                                <span className={`badge ${trip.status === 'Planning' || trip.status === 'Planned' ? 'badge-planned' : 'badge-completed'} mt-2`}>
                                                    {trip.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <Link
                                            to={`/trips/${trip.id}`}
                                            className="text-sm text-primary hover:text-primary-dark font-medium"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3 py-2">
                                <div className="flex-shrink-0">
                                    {activity.type === 'lesson' && <span className="text-xl">📝</span>}
                                    {activity.type === 'trip' && <span className="text-xl">➕</span>}
                                    {activity.type === 'vendor' && <span className="text-xl">🏪</span>}
                                    {activity.type === 'info' && <span className="text-xl">ℹ️</span>}
                                    {activity.type === 'error' && <span className="text-xl">⚠️</span>}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">{activity.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/trips/create" className="btn-primary text-center">
                        ➕ Create New Trip
                    </Link>
                    <Link to="/trips" className="btn-secondary text-center">
                        🔍 Search Trips
                    </Link>
                    <Link to="/lessons" className="btn-secondary text-center">
                        📚 Browse Lessons
                    </Link>
                </div>
            </div>

            {/* Critical Lessons */}
            {criticalLessons.length > 0 && (
                <div className="card bg-red-50 border-2 border-red-200">
                    <h2 className="text-xl font-bold text-red-900 mb-4">
                        ⚠️ Lessons Learned Highlights (Critical Priority)
                    </h2>
                    <div className="space-y-3">
                        {criticalLessons.map((lesson) => (
                            <div key={lesson.id} className="bg-white border border-red-200 rounded-lg p-4">
                                <h3 className="font-semibold text-red-900">{lesson.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    From: {lesson.trip} | Category: {lesson.category}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Getting Started Guide (shows when no trips) */}
            {stats.totalTrips === 0 && (
                <div className="card bg-blue-50 border-2 border-blue-200">
                    <h2 className="text-xl font-bold text-blue-900 mb-4">
                        🎉 Welcome to Your Trip Planning System!
                    </h2>
                    <div className="space-y-3 text-gray-700">
                        <p>Your system is connected and ready to go! Here's how to get started:</p>
                        <ol className="list-decimal list-inside space-y-2 ml-4">
                            <li>Click "Create New Trip" to plan your first adventure</li>
                            <li>Choose a template (Spring Break, Day Trip, Service Event, etc.)</li>
                            <li>Fill in the details and the system will track everything</li>
                            <li>Add lessons learned after the trip to build your knowledge base</li>
                        </ol>
                        <div className="mt-4">
                            <Link to="/trips/create" className="btn-primary inline-block">
                                Get Started - Create First Trip →
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard