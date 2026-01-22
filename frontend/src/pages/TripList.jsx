import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { tripAPI } from '../services/api'

function TripList() {
    const [trips, setTrips] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        trip_type: '',
        status: '',
        start_date_from: '',
        start_date_to: '',
        sort: 'date_desc'
    })

    const [showFilters, setShowFilters] = useState(false)

    // Trip type options
    const tripTypes = [
        'Spring Break Trip',
        'Fall Break Trip',
        'Day of Service Event',
        'Same Day Reward Event',
        'Vertical Escape Trip',
        'Day Trip',
        'International Trip'
    ]

    // Status options
    const statusOptions = ['Planned', 'In Progress', 'Completed', 'Cancelled']

    // Fetch trips from API
    const fetchTrips = async () => {
        try {
            setLoading(true)
            setError(null)

            // Build query params
            const params = {}
            if (filters.search) params.search = filters.search
            if (filters.trip_type) params.trip_type = filters.trip_type
            if (filters.status) params.status = filters.status
            if (filters.start_date_from) params.start_date_from = filters.start_date_from
            if (filters.start_date_to) params.start_date_to = filters.start_date_to

            console.log('Fetching trips with params:', params)

            const response = await tripAPI.getAll(params)
            console.log('Trips response:', response.data)

            if (response.data.success) {
                setTrips(response.data.data || [])
            }

            setLoading(false)
        } catch (err) {
            console.error('Error fetching trips:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    // Fetch trips on mount and when filters change
    useEffect(() => {
        fetchTrips()
    }, [filters.trip_type, filters.status, filters.start_date_from, filters.start_date_to])

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault()
        fetchTrips()
    }

    // Handle filter change
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }))
    }

    // Clear all filters
    const clearFilters = () => {
        setFilters({
            search: '',
            trip_type: '',
            status: '',
            start_date_from: '',
            start_date_to: '',
            sort: 'date_desc'
        })
    }

    // Get trip icon based on type
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

    // Format date range
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

    // Get duration text
    const getDuration = (trip) => {
        if (trip.duration_days) {
            return `${trip.duration_days} ${trip.duration_days === 1 ? 'day' : 'days'}`
        }
        if (trip.duration_hours) {
            return `${trip.duration_hours} ${trip.duration_hours === 1 ? 'hour' : 'hours'}`
        }
        return 'Duration TBD'
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Trips</h1>
                    <p className="mt-1 text-gray-600">
                        Browse and search all crew trips
                    </p>
                </div>
                <Link to="/trips/create" className="btn-primary">
                    ➕ Create Trip
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="card">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search trips by name, destination, or notes..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="input-field flex-1"
                        />
                        <button type="submit" className="btn-primary px-6">
                            🔍 Search
                        </button>
                    </div>
                </form>

                {/* Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-sm text-primary hover:text-primary-dark font-medium mb-4"
                >
                    {showFilters ? '▼ Hide Filters' : '▶ Show Filters'}
                </button>

                {/* Filters */}
                {showFilters && (
                    <div className="border-t pt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Trip Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trip Type
                                </label>
                                <select
                                    value={filters.trip_type}
                                    onChange={(e) => handleFilterChange('trip_type', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">All Types</option>
                                    {tripTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">All Statuses</option>
                                    {statusOptions.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Date From */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.start_date_from}
                                    onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
                                    className="input-field"
                                />
                            </div>

                            {/* Date To */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.start_date_to}
                                    onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        <div>
                            <button
                                onClick={clearFilters}
                                className="btn-secondary text-sm"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">⚠️</span>
                        <div>
                            <h3 className="font-semibold text-red-900">Error Loading Trips</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl text-gray-600">Loading trips...</p>
                </div>
            )}

            {/* Trip Count */}
            {!loading && !error && (
                <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                        Showing <span className="font-semibold">{trips.length}</span> trip{trips.length !== 1 ? 's' : ''}
                    </p>
                </div>
            )}

            {/* Trips List */}
            {!loading && !error && (
                <div className="space-y-4">
                    {trips.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="text-6xl mb-4">🏕️</div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h3>
                            <p className="text-gray-600 mb-6">
                                {filters.search || filters.trip_type || filters.status
                                    ? 'Try adjusting your filters or search terms'
                                    : 'Get started by creating your first trip!'}
                            </p>
                            <Link to="/trips/create" className="btn-primary inline-block">
                                ➕ Create First Trip
                            </Link>
                        </div>
                    ) : (
                        trips.map((trip) => (
                            <div key={trip.trip_id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        {/* Trip Icon */}
                                        <div className="text-4xl">{getTripIcon(trip.trip_type)}</div>

                                        {/* Trip Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {trip.trip_name}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                                <span className="font-medium">{trip.trip_type}</span>
                                                <span>•</span>
                                                <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                                                <span>•</span>
                                                <span>{getDuration(trip)}</span>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                                                {trip.total_cost && (
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-gray-500">💰</span>
                                                        <span className="font-medium">
                                                            ${trip.total_cost}
                                                            {trip.cost_per_person && ` ($${trip.cost_per_person}/person)`}
                                                        </span>
                                                    </div>
                                                )}

                                                {trip.participant_count > 0 && (
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-gray-500">👥</span>
                                                        <span>{trip.participant_count} participant{trip.participant_count !== 1 ? 's' : ''}</span>
                                                    </div>
                                                )}

                                                {trip.leaders && (
                                                    <div className="flex items-center space-x-1">
                                                        <span className="text-gray-500">👤</span>
                                                        <span>{trip.leaders}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Status Badge */}
                                            <div className="flex items-center gap-2">
                                                <span className={`badge ${trip.trip_status === 'Planned' ? 'badge-planned' :
                                                        trip.trip_status === 'In Progress' ? 'badge-in-progress' :
                                                            trip.trip_status === 'Completed' ? 'badge-completed' :
                                                                'badge-cancelled'
                                                    }`}>
                                                    {trip.trip_status}
                                                </span>

                                                {trip.destination && (
                                                    <span className="text-sm text-gray-500">
                                                        📍 {trip.destination}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Trip Summary (if exists) */}
                                            {trip.trip_summary && (
                                                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                                                    {trip.trip_summary}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                                    <Link
                                        to={`/trips/${trip.trip_id}`}
                                        className="btn-primary flex-1 text-center"
                                    >
                                        View Details
                                    </Link>
                                    <button className="btn-secondary">
                                        Edit
                                    </button>
                                    <button className="btn-secondary">
                                        Clone
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default TripList