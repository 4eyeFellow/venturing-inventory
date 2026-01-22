import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function EditTrip() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    // Form data
    const [formData, setFormData] = useState({
        trip_name: '',
        destination: '',
        state_country: '',
        start_date: '',
        end_date: '',
        duration_days: 0,
        duration_hours: 0,
        num_participants: 10,
        trip_type: '',
        trip_status: 'Planned',
        trip_summary: '',
        notes: '',
        funding_source: 'Participant payments',
        leaders: [],
        venue_contacts: [],
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_email: '',
        emergency_contact_relationship: ''
    })

    // Load existing trip data
    useEffect(() => {
        const loadTrip = async () => {
            console.log('🔄 EditTrip: Starting to load trip with ID:', id)
            console.log('🔄 EditTrip: API_URL is:', API_URL)
            setLoading(true)
            try {
                console.log('📡 Fetching trip from:', `${API_URL}/trips/${id}`)
                const tripResponse = await fetch(`${API_URL}/trips/${id}`)
                const tripData = await tripResponse.json()
                console.log('✅ Trip data received:', tripData)
                
                if (!tripData.success) {
                    console.error('❌ Trip data not successful:', tripData)
                    setError('Failed to load trip')
                    setLoading(false)
                    return
                }

                const trip = tripData.data
                console.log('📋 Trip details:', trip)

                // Load venue contacts
                console.log('📡 Fetching venue contacts from:', `${API_URL}/trips/${id}/venue-contacts`)
                const venueResponse = await fetch(`${API_URL}/trips/${id}/venue-contacts`)
                const venueData = await venueResponse.json()
                console.log('✅ Venue data received:', venueData)

                // Format dates for input fields (YYYY-MM-DD)
                const formatDate = (dateStr) => {
                    if (!dateStr) return ''
                    return dateStr.split('T')[0]
                }

                const newFormData = {
                    trip_name: trip.trip_name || '',
                    destination: trip.destination || '',
                    state_country: trip.state_country || '',
                    start_date: formatDate(trip.start_date),
                    end_date: formatDate(trip.end_date),
                    duration_days: trip.duration_days || 0,
                    duration_hours: trip.duration_hours || 0,
                    num_participants: trip.num_participants || 10,
                    trip_type: trip.trip_type || '',
                    trip_status: trip.trip_status || 'Planned',
                    trip_summary: trip.trip_summary || '',
                    notes: trip.notes || '',
                    funding_source: trip.funding_source || 'Participant payments',
                    leaders: trip.leaders || [],
                    venue_contacts: venueData.success ? venueData.data : [],
                    emergency_contact_name: trip.emergency_contact_name || '',
                    emergency_contact_phone: trip.emergency_contact_phone || '',
                    emergency_contact_email: trip.emergency_contact_email || '',
                    emergency_contact_relationship: trip.emergency_contact_relationship || ''
                }

                console.log('📝 Setting form data:', newFormData)
                setFormData(newFormData)
                console.log('✅ Form data set, setting loading to false')
                setLoading(false)
            } catch (err) {
                console.error('❌ Error loading trip:', err)
                setError('Failed to load trip data: ' + err.message)
                setLoading(false)
            }
        }

        loadTrip()
    }, [id])

    // Calculate duration when dates change
    useEffect(() => {
        if (formData.start_date && formData.end_date) {
            const start = new Date(formData.start_date)
            const end = new Date(formData.end_date)
            const diffTime = Math.abs(end - start)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            if (diffDays > 0) {
                setFormData(prev => ({ ...prev, duration_days: diffDays, duration_hours: 0 }))
            }
        }
    }, [formData.start_date, formData.end_date])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            // Update trip basic info
            const updateResponse = await fetch(`${API_URL}/trips/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trip_name: formData.trip_name,
                    destination: formData.destination,
                    state_country: formData.state_country,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    duration_days: formData.duration_days,
                    duration_hours: formData.duration_hours,
                    num_participants: formData.num_participants,
                    trip_type: formData.trip_type,
                    trip_status: formData.trip_status,
                    trip_summary: formData.trip_summary,
                    notes: formData.notes,
                    funding_source: formData.funding_source,
                    emergency_contact_name: formData.emergency_contact_name,
                    emergency_contact_phone: formData.emergency_contact_phone,
                    emergency_contact_email: formData.emergency_contact_email,
                    emergency_contact_relationship: formData.emergency_contact_relationship
                })
            })

            const updateData = await updateResponse.json()

            if (!updateData.success && !updateResponse.ok) {
                throw new Error(updateData.error || 'Failed to update trip')
            }

            alert('Trip updated successfully!')
            navigate(`/trips/${id}`)
        } catch (err) {
            console.error('Error updating trip:', err)
            setError(err.message)
            setSaving(false)
        }
    }

    const addLeader = () => {
        setFormData({
            ...formData,
            leaders: [...formData.leaders, { name: '', role: '', email: '', phone: '' }]
        })
    }

    const removeLeader = (index) => {
        setFormData({
            ...formData,
            leaders: formData.leaders.filter((_, i) => i !== index)
        })
    }

    const updateLeader = (index, field, value) => {
        const updated = [...formData.leaders]
        updated[index][field] = value
        setFormData({ ...formData, leaders: updated })
    }

    const addVenue = () => {
        setFormData({
            ...formData,
            venue_contacts: [
                ...formData.venue_contacts,
                {
                    venue_name: '',
                    contact_person: '',
                    contact_phone: '',
                    contact_email: '',
                    venue_type: 'Campground',
                    address: '',
                    notes: ''
                }
            ]
        })
    }

    const removeVenue = (index) => {
        setFormData({
            ...formData,
            venue_contacts: formData.venue_contacts.filter((_, i) => i !== index)
        })
    }

    const updateVenue = (index, field, value) => {
        const updated = [...formData.venue_contacts]
        updated[index][field] = value
        setFormData({ ...formData, venue_contacts: updated })
    }

    const formatPhoneNumber = (value) => {
        const formatted = value.replace(/\D/g, '').slice(0, 10)
        if (formatted.length <= 3) return formatted
        if (formatted.length <= 6) return `(${formatted.slice(0, 3)}) ${formatted.slice(3)}`
        return `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl text-gray-600">Loading trip data...</p>
                </div>
            </div>
        )
    }

    if (error && !formData.trip_name) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="text-center">
                        <span className="text-6xl mb-4 block">⚠️</span>
                        <h2 className="text-2xl font-bold text-red-900 mb-2">Error Loading Trip</h2>
                        <p className="text-red-700 mb-4">{error}</p>
                        <button onClick={() => navigate('/trips')} className="btn-primary">
                            Back to Trips
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
                    <p className="mt-1 text-gray-600">Update trip information and details</p>
                </div>
                <button
                    onClick={() => navigate(`/trips/${id}`)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕ Cancel
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="text-red-900 font-semibold">⚠️ {error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trip Name *
                            </label>
                            <input
                                type="text"
                                value={formData.trip_name}
                                onChange={(e) => setFormData({ ...formData, trip_name: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Destination *
                                </label>
                                <input
                                    type="text"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State/Country
                                </label>
                                <input
                                    type="text"
                                    value={formData.state_country}
                                    onChange={(e) => setFormData({ ...formData, state_country: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    End Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Participants
                                </label>
                                <input
                                    type="number"
                                    value={formData.num_participants}
                                    onChange={(e) => setFormData({ ...formData, num_participants: parseInt(e.target.value) })}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trip Type
                                </label>
                                <select
                                    value={formData.trip_type}
                                    onChange={(e) => setFormData({ ...formData, trip_type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="">Select type...</option>
                                    <option value="Spring Break Trip">Spring Break Trip</option>
                                    <option value="Fall Break Trip">Fall Break Trip</option>
                                    <option value="Day of Service Event">Day of Service Event</option>
                                    <option value="Same Day Reward Event">Same Day Reward Event</option>
                                    <option value="Vertical Escape Trip">Vertical Escape Trip</option>
                                    <option value="Day Trip">Day Trip</option>
                                    <option value="International Trip">International Trip</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.trip_status}
                                    onChange={(e) => setFormData({ ...formData, trip_status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="Planned">Planned</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trip Summary
                            </label>
                            <textarea
                                value={formData.trip_summary}
                                onChange={(e) => setFormData({ ...formData, trip_summary: e.target.value })}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Trip Leaders */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Trip Leaders</h2>
                        <button
                            type="button"
                            onClick={addLeader}
                            className="btn-secondary text-sm"
                        >
                            + Add Leader
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.leaders.map((leader, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium text-gray-900">Leader #{index + 1}</h5>
                                    <button
                                        type="button"
                                        onClick={() => removeLeader(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        ✕ Remove
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={leader.leader_name || leader.name || ''}
                                            onChange={(e) => updateLeader(index, 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <input
                                            type="text"
                                            value={leader.leader_role || leader.role || ''}
                                            onChange={(e) => updateLeader(index, 'role', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={leader.leader_email || leader.email || ''}
                                            onChange={(e) => updateLeader(index, 'email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={leader.leader_phone || leader.phone || ''}
                                            onChange={(e) => updateLeader(index, 'phone', formatPhoneNumber(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Venue Contacts */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">📍 Venue Contacts</h2>
                        <button
                            type="button"
                            onClick={addVenue}
                            className="btn-secondary text-sm"
                        >
                            + Add Venue
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.venue_contacts.map((venue, index) => (
                            <div key={index} className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-medium text-gray-900">Venue #{index + 1}</h5>
                                    <button
                                        type="button"
                                        onClick={() => removeVenue(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        ✕ Remove
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                                        <input
                                            type="text"
                                            value={venue.venue_name}
                                            onChange={(e) => updateVenue(index, 'venue_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={venue.venue_type}
                                            onChange={(e) => updateVenue(index, 'venue_type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="Campground">Campground</option>
                                            <option value="Lodge">Lodge/Hotel</option>
                                            <option value="Activity Provider">Activity Provider</option>
                                            <option value="Restaurant">Restaurant</option>
                                            <option value="Rental Company">Rental Company</option>
                                            <option value="Transportation">Transportation</option>
                                            <option value="Park Office">Park Office</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                        <input
                                            type="text"
                                            value={venue.contact_person}
                                            onChange={(e) => updateVenue(index, 'contact_person', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={venue.contact_phone}
                                            onChange={(e) => updateVenue(index, 'contact_phone', formatPhoneNumber(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={venue.contact_email}
                                            onChange={(e) => updateVenue(index, 'contact_email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={venue.address}
                                            onChange={(e) => updateVenue(index, 'address', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emergency Contact */}
                <div className="card bg-red-50 border-2 border-red-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 Emergency Contact</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                            <input
                                type="text"
                                value={formData.emergency_contact_name}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                            <input
                                type="text"
                                value={formData.emergency_contact_relationship}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.emergency_contact_phone}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: formatPhoneNumber(e.target.value) })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.emergency_contact_email}
                                onChange={(e) => setFormData({ ...formData, emergency_contact_email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Funding Source
                            </label>
                            <input
                                type="text"
                                value={formData.funding_source}
                                onChange={(e) => setFormData({ ...formData, funding_source: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Planning Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => navigate(`/trips/${id}`)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary px-8"
                        >
                            {saving ? '⏳ Saving...' : '✓ Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default EditTrip
