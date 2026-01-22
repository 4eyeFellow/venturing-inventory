import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { tripAPI, lessonsAPI, costsAPI } from '../services/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function TripDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [trip, setTrip] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [venueContacts, setVenueContacts] = useState([])

    // Inventory integration
    const [inventoryEquipment, setInventoryEquipment] = useState([])
    const [loadingInventory, setLoadingInventory] = useState(false)

    // Modal states
    const [showCostModal, setShowCostModal] = useState(false)
    const [showActivityModal, setShowActivityModal] = useState(false)
    const [showLessonModal, setShowLessonModal] = useState(false)
    const [showEquipmentModal, setShowEquipmentModal] = useState(false)

    useEffect(() => {
        const loadTripData = async () => {
            setLoading(true)
            try {
                // Load trip details
                const tripResponse = await fetch(`${API_URL}/trips/${id}`)
                const tripData = await tripResponse.json()
                if (tripData.success) {
                    setTrip(tripData.data)
                }

                // Load costs
                const costsResponse = await fetch(`${API_URL}/trips/${id}/costs`)
                const costsData = await costsResponse.json()
                if (costsData.success) {
                    setCosts(costsData.data)
                }

                // Load activities
                const activitiesResponse = await fetch(`${API_URL}/trips/${id}/activities`)
                const activitiesData = await activitiesResponse.json()
                if (activitiesData.success) {
                    setActivities(activitiesData.data)
                }

                // Load lessons
                const lessonsResponse = await fetch(`${API_URL}/trips/${id}/lessons`)
                const lessonsData = await lessonsResponse.json()
                if (lessonsData.success) {
                    setLessons(lessonsData.data)
                }

                // Load equipment
                const equipmentResponse = await fetch(`${API_URL}/trips/${id}/equipment`)
                const equipmentData = await equipmentResponse.json()
                if (equipmentData.success) {
                    setEquipment(equipmentData.data)
                }

                // ADD THIS - Load venue contacts
                const venueResponse = await fetch(`${API_URL}/trips/${id}/venue-contacts`)
                const venueData = await venueResponse.json()
                if (venueData.success) {
                    setVenueContacts(venueData.data)
                }

                setLoading(false)
            } catch (err) {
                console.error('Error loading trip data:', err)
                setLoading(false)
            }
        }

        loadTripData()
    }, [id])

    // Form states
    const [costForm, setCostForm] = useState({
        cost_category: 'Transportation',
        cost_item: '',
        estimated_cost: 0,
        actual_cost: null,
        quantity: 1
    })

    const [activityForm, setActivityForm] = useState({
        scheduled_date: trip?.start_date || '',
        activity_name: '',
        activity_description: '',
        scheduled_start_time: '',
        scheduled_end_time: '',
        location: ''
    })

    const [lessonForm, setLessonForm] = useState({
        lesson_category: 'Safety',
        lesson_type: 'What Went Well',
        lesson_title: '',
        lesson_description: '',
        priority: 'Important',
        applicable_to_trip_types: ''
    })

    const [equipmentForm, setEquipmentForm] = useState({
        equipment_category: 'Tents & Shelter',
        equipment_item: '',
        quantity_needed: 1,
        crew_owned: true,
        rental_needed: false,
        rental_source: '',
        rental_cost: null,
        // New fields for inventory integration
        inventory_item_id: '',
        use_inventory: true,
        // Filter state
        filter_category: 'All'
    })

    useEffect(() => {
        fetchTrip()
    }, [id])

    // Fetch inventory when equipment modal opens
    useEffect(() => {
        if (showEquipmentModal) {
            fetchInventoryEquipment()
        }
    }, [showEquipmentModal])

    const fetchTrip = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await tripAPI.getById(id)

            if (response.data.success) {
                setTrip(response.data.data)
            }

            setLoading(false)
        } catch (err) {
            console.error('Error fetching trip:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    // NEW: Fetch inventory equipment
    const fetchInventoryEquipment = async () => {
        try {
            setLoadingInventory(true)
            const response = await fetch('http://localhost:3001/api/equipment')

            if (!response.ok) {
                throw new Error('Failed to fetch inventory')
            }

            const data = await response.json()
            setInventoryEquipment(data)
            setLoadingInventory(false)
        } catch (err) {
            console.error('Error fetching inventory:', err)
            setLoadingInventory(false)
            // Continue without inventory integration
        }
    }

    // NEW: Handle inventory item selection
    const handleInventorySelect = (e) => {
        const itemId = e.target.value

        if (!itemId) {
            // Reset to manual entry
            setEquipmentForm({
                ...equipmentForm,
                inventory_item_id: '',
                equipment_item: '',
                equipment_category: equipmentForm.filter_category === 'All' ? 'Tents & Shelter' : equipmentForm.filter_category,
                use_inventory: false
            })
            return
        }

        const selectedItem = inventoryEquipment.find(item => item.id === parseInt(itemId))

        if (selectedItem) {
            setEquipmentForm({
                ...equipmentForm,
                inventory_item_id: itemId,
                equipment_item: selectedItem.item_name,
                equipment_category: selectedItem.category,
                quantity_needed: 1,
                crew_owned: true,
                rental_needed: selectedItem.quantity_available === 0,
                use_inventory: true
            })
        }
    }

    // NEW: Get filtered inventory based on category
    const getFilteredInventory = () => {
        if (equipmentForm.filter_category === 'All') {
            return inventoryEquipment
        }
        return inventoryEquipment.filter(item => item.category === equipmentForm.filter_category)
    }

    // Add Cost Item
    const handleAddCost = async (e) => {
        e.preventDefault()
        try {
            const costData = {
                trip_id: parseInt(id),
                ...costForm
            }

            await costsAPI.addToTrip(id, costData)
            await fetchTrip()

            setCostForm({
                cost_category: 'Transportation',
                cost_item: '',
                estimated_cost: 0,
                actual_cost: null,
                quantity: 1
            })
            setShowCostModal(false)

            alert('Cost item added successfully!')
        } catch (err) {
            console.error('Error adding cost:', err)
            alert('Failed to add cost item: ' + err.message)
        }
    }

    // Add Activity
    const handleAddActivity = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:5000/api/activities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    trip_id: parseInt(id),
                    ...activityForm
                })
            })

            if (!response.ok) throw new Error('Failed to add activity')

            await fetchTrip()

            setActivityForm({
                scheduled_date: trip?.start_date || '',
                activity_name: '',
                activity_description: '',
                scheduled_start_time: '',
                scheduled_end_time: '',
                location: ''
            })
            setShowActivityModal(false)

            alert('Activity added successfully!')
        } catch (err) {
            console.error('Error adding activity:', err)
            alert('Failed to add activity: ' + err.message)
        }
    }

    // Add Lesson
    const handleAddLesson = async (e) => {
        e.preventDefault()
        try {
            const lessonData = {
                trip_id: parseInt(id),
                ...lessonForm,
                applicable_to_trip_types: lessonForm.applicable_to_trip_types || trip?.trip_type,
                created_by: 'zgrant4056@gmail.com'
            }

            await lessonsAPI.create(lessonData)
            await fetchTrip()

            setLessonForm({
                lesson_category: 'Safety',
                lesson_type: 'What Went Well',
                lesson_title: '',
                lesson_description: '',
                priority: 'Important',
                applicable_to_trip_types: ''
            })
            setShowLessonModal(false)

            alert('Lesson added successfully!')
        } catch (err) {
            console.error('Error adding lesson:', err)
            alert('Failed to add lesson: ' + err.message)
        }
    }

    // Add Equipment
    const handleAddEquipment = async (e) => {
        e.preventDefault()
        try {
            // Check availability if using inventory
            if (equipmentForm.use_inventory && equipmentForm.inventory_item_id) {
                const selectedItem = inventoryEquipment.find(item => item.id === parseInt(equipmentForm.inventory_item_id))

                if (selectedItem && selectedItem.quantity_available < equipmentForm.quantity_needed) {
                    const proceed = window.confirm(
                        `Warning: Only ${selectedItem.quantity_available} available, but you need ${equipmentForm.quantity_needed}. ` +
                        `Would you like to mark this as rental needed?`
                    )

                    if (proceed) {
                        equipmentForm.rental_needed = true
                    } else {
                        return
                    }
                }
            }

            const equipmentData = {
                trip_id: parseInt(id),
                equipment_category: equipmentForm.equipment_category,
                equipment_item: equipmentForm.equipment_item,
                quantity_needed: equipmentForm.quantity_needed,
                crew_owned: equipmentForm.crew_owned,
                rental_needed: equipmentForm.rental_needed,
                rental_source: equipmentForm.rental_source || null,
                rental_cost: equipmentForm.rental_cost || null
            }

            console.log('Submitting equipment data:', equipmentData)

            const response = await fetch('http://localhost:5000/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(equipmentData)
            })

            console.log('Response status:', response.status)

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Error response:', errorData)
                throw new Error(errorData.error || 'Failed to add equipment')
            }

            const result = await response.json()
            console.log('Success result:', result)

            await fetchTrip()

            setEquipmentForm({
                equipment_category: 'Tents & Shelter',
                equipment_item: '',
                quantity_needed: 1,
                crew_owned: true,
                rental_needed: false,
                rental_source: '',
                rental_cost: null,
                inventory_item_id: '',
                use_inventory: true,
                filter_category: 'All'
            })
            setShowEquipmentModal(false)

            alert('Equipment added successfully!')
        } catch (err) {
            console.error('Error adding equipment:', err)
            alert('Failed to add equipment: ' + err.message)
        }
    }

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

    const formatDate = (dateString) => {
        if (!dateString) return 'Date TBD'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }

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

    const getDayOfWeek = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { weekday: 'long' })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl text-gray-600">Loading trip details...</p>
                </div>
            </div>
        )
    }

    if (error || !trip) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="text-center">
                        <span className="text-6xl mb-4 block">⚠️</span>
                        <h2 className="text-2xl font-bold text-red-900 mb-2">Trip Not Found</h2>
                        <p className="text-red-700 mb-4">{error || 'This trip does not exist or has been deleted.'}</p>
                        <Link to="/trips" className="btn-primary inline-block">Back to Trips</Link>
                    </div>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'details', label: 'Details', icon: '📋' },
        { id: 'costs', label: 'Costs', icon: '💰' },
        { id: 'itinerary', label: 'Itinerary', icon: '📅' },
        { id: 'lessons', label: 'Lessons', icon: '📚' },
        { id: 'equipment', label: 'Equipment', icon: '🎒' }
    ]

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <Link to="/trips" className="text-sm text-primary hover:text-primary-dark mb-2 inline-block">
                        ← Back to Trips
                    </Link>
                    <div className="flex items-start space-x-4">
                        <div className="text-5xl">{getTripIcon(trip.trip_type)}</div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{trip.trip_name}</h1>
                            <div className="flex items-center space-x-3 mt-2 text-gray-600">
                                <span className="font-medium">{trip.trip_type}</span>
                                <span>•</span>
                                <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                                <span>•</span>
                                <span>
                                    {trip.duration_days > 0 ? `${trip.duration_days} days` : `${trip.duration_hours} hours`}
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className={`badge ${trip.trip_status === 'Planned' ? 'badge-planned' :
                                    trip.trip_status === 'In Progress' ? 'badge-in-progress' :
                                        trip.trip_status === 'Completed' ? 'badge-completed' :
                                            'badge-cancelled'
                                    }`}>
                                    {trip.trip_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button onClick={() => navigate(`/trips/${id}/edit`)} className="btn-secondary">Edit Trip</button>
                    <button className="btn-secondary">Clone</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
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

            {/* Tab Content - Overview and other tabs same as before */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <>
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${trip.total_cost ? parseFloat(trip.total_cost).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Per Person</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${trip.cost_per_person ? parseFloat(trip.cost_per_person).toFixed(2) : '0.00'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Participants</p>
                                    <p className="text-2xl font-bold text-gray-900">{trip.num_participants || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {trip.duration_days > 0 ? `${trip.duration_days} days` : `${trip.duration_hours} hrs`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {trip.destination && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">📍 Destination</h2>
                                <p className="text-lg">
                                    {trip.destination}
                                    {trip.state_country && `, ${trip.state_country}`}
                                </p>
                            </div>
                        )}

                        {trip.leaders && trip.leaders.length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Trip Leaders</h2>
                                <div className="space-y-3">
                                    {trip.leaders.map((leader, index) => (
                                        <div key={index} className="flex items-start justify-between border-b pb-3 last:border-b-0">
                                            <div>
                                                <p className="font-semibold text-gray-900">{leader.leader_name}</p>
                                                <p className="text-sm text-gray-600">{leader.leader_role}</p>
                                            </div>
                                            <div className="text-right text-sm text-gray-600">
                                                {leader.leader_email && <p>{leader.leader_email}</p>}
                                                {leader.leader_phone && <p>{leader.leader_phone}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {venueContacts.length > 0 && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">📍 Venue Contacts</h2>
                                <div className="space-y-3">
                                    {venueContacts.map((venue) => (
                                        <div key={venue.id} className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-medium text-gray-900">{venue.venue_name}</p>
                                                    <p className="text-xs text-gray-500">{venue.venue_type}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-1 text-sm">
                                                {venue.contact_person && (
                                                    <p className="flex justify-between">
                                                        <span className="font-medium">Contact:</span>
                                                        <span>{venue.contact_person}</span>
                                                    </p>
                                                )}
                                                {venue.contact_phone && (
                                                    <p className="flex justify-between">
                                                        <span className="font-medium">Phone:</span>
                                                        <a href={`tel:${venue.contact_phone}`} className="text-primary hover:underline">
                                                            {venue.contact_phone}
                                                        </a>
                                                    </p>
                                                )}
                                                {venue.contact_email && (
                                                    <p className="flex justify-between">
                                                        <span className="font-medium">Email:</span>
                                                        <a href={`mailto:${venue.contact_email}`} className="text-primary hover:underline">
                                                            {venue.contact_email}
                                                        </a>
                                                    </p>
                                                )}
                                                {venue.address && (
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        📍 {venue.address}
                                                    </p>
                                                )}
                                                {venue.notes && (
                                                    <p className="text-xs text-gray-600 mt-2 italic">
                                                        {venue.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(trip.emergency_contact_name || trip.emergency_contact_phone) && (
                            <div className="card bg-red-50 border-2 border-red-200">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">🚨 Emergency Contact</h2>
                                <div className="space-y-2 text-sm">
                                    {trip.emergency_contact_name && (
                                        <p className="flex justify-between">
                                            <span className="font-medium">Name:</span>
                                            <span>{trip.emergency_contact_name}</span>
                                        </p>
                                    )}
                                    {trip.emergency_contact_relationship && (
                                        <p className="flex justify-between">
                                            <span className="font-medium">Relationship:</span>
                                            <span>{trip.emergency_contact_relationship}</span>
                                        </p>
                                    )}
                                    {trip.emergency_contact_phone && (
                                        <p className="flex justify-between">
                                            <span className="font-medium">Phone:</span>
                                            <a href={`tel:${trip.emergency_contact_phone}`} className="text-primary hover:underline">
                                                {trip.emergency_contact_phone}
                                            </a>
                                        </p>
                                    )}
                                    {trip.emergency_contact_email && (
                                        <p className="flex justify-between">
                                            <span className="font-medium">Email:</span>
                                            <a href={`mailto:${trip.emergency_contact_email}`} className="text-primary hover:underline">
                                                {trip.emergency_contact_email}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {trip.trip_summary && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">📝 Trip Summary</h2>
                                <p className="text-gray-700">{trip.trip_summary}</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'details' && (
                    <>
                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">📅 Dates & Duration</h2>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Start Date</p>
                                        <p className="font-semibold">
                                            {formatDate(trip.start_date)}
                                            {trip.start_date && ` (${getDayOfWeek(trip.start_date)})`}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">End Date</p>
                                        <p className="font-semibold">
                                            {formatDate(trip.end_date)}
                                            {trip.end_date && ` (${getDayOfWeek(trip.end_date)})`}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <p className="font-semibold">
                                        {trip.duration_days > 0 && `${trip.duration_days} days`}
                                        {trip.duration_hours > 0 && trip.duration_days === 0 && `${trip.duration_hours} hours`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">🗺️ Location Details</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Destination</p>
                                    <p className="font-semibold">{trip.destination || 'Not specified'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">State/Country</p>
                                    <p className="font-semibold">{trip.state_country || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">💼 Funding</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Funding Source</p>
                                    <p className="font-semibold">{trip.funding_source || 'Not specified'}</p>
                                </div>
                            </div>
                        </div>

                        {trip.notes && (
                            <div className="card">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Planning Notes</h2>
                                <p className="text-gray-700 whitespace-pre-wrap">{trip.notes}</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'costs' && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">💰 Budget Breakdown</h2>
                            <button
                                onClick={() => setShowCostModal(true)}
                                className="btn-primary text-sm"
                            >
                                + Add Cost Item
                            </button>
                        </div>

                        {trip.costs && trip.costs.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b-2 border-gray-200">
                                                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Category</th>
                                                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Item</th>
                                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Qty</th>
                                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Estimate</th>
                                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Actual</th>
                                                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Variance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trip.costs.map((cost, index) => {
                                                const estimated = parseFloat(cost.estimated_cost) || 0
                                                const actual = parseFloat(cost.actual_cost) || 0
                                                const variance = actual - estimated
                                                const varianceColor = variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-600'

                                                return (
                                                    <tr key={index} className="border-b border-gray-100">
                                                        <td className="py-3 px-2">
                                                            <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                                                {cost.cost_category}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-2 text-sm">{cost.cost_item}</td>
                                                        <td className="py-3 px-2 text-sm text-right">{cost.quantity || 1}</td>
                                                        <td className="py-3 px-2 text-sm text-right">${estimated.toFixed(2)}</td>
                                                        <td className="py-3 px-2 text-sm text-right">
                                                            {actual > 0 ? `$${actual.toFixed(2)}` : '—'}
                                                        </td>
                                                        <td className={`py-3 px-2 text-sm text-right font-medium ${varianceColor}`}>
                                                            {actual > 0 ? (variance >= 0 ? '+' : '') + `$${variance.toFixed(2)}` : '—'}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>TOTAL</span>
                                        <span className="text-primary">
                                            ${trip.total_cost ? parseFloat(trip.total_cost).toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                                        <span>Cost per person ({trip.num_participants} participants)</span>
                                        <span className="font-semibold">
                                            ${trip.cost_per_person ? parseFloat(trip.cost_per_person).toFixed(2) : '0.00'}
                                        </span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No cost items recorded for this trip</p>
                                <button
                                    onClick={() => setShowCostModal(true)}
                                    className="btn-primary"
                                >
                                    + Add First Cost Item
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'itinerary' && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">📅 Day-by-Day Schedule</h2>
                            <button
                                onClick={() => setShowActivityModal(true)}
                                className="btn-primary text-sm"
                            >
                                + Add Activity
                            </button>
                        </div>

                        {trip.activities && trip.activities.length > 0 ? (
                            <div className="space-y-6">
                                {trip.activities.map((activity, index) => (
                                    <div key={index} className="border-l-4 border-primary pl-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {formatDate(activity.scheduled_date)}
                                                </p>
                                                {activity.scheduled_start_time && (
                                                    <p className="text-sm text-gray-600">
                                                        {activity.scheduled_start_time}
                                                        {activity.scheduled_end_time && ` - ${activity.scheduled_end_time}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{activity.activity_name}</h3>
                                        {activity.activity_description && (
                                            <p className="text-sm text-gray-700">{activity.activity_description}</p>
                                        )}
                                        {activity.location && (
                                            <p className="text-sm text-gray-600 mt-1">📍 {activity.location}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📅</div>
                                <p className="text-gray-500 mb-4">No itinerary created yet</p>
                                <button
                                    onClick={() => setShowActivityModal(true)}
                                    className="btn-primary"
                                >
                                    + Add First Activity
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'lessons' && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">📚 Lessons Learned</h2>
                            <button
                                onClick={() => setShowLessonModal(true)}
                                className="btn-primary text-sm"
                            >
                                + Add Lesson
                            </button>
                        </div>

                        {trip.lessons && trip.lessons.length > 0 ? (
                            <div className="space-y-4">
                                {trip.lessons.map((lesson) => (
                                    <div key={lesson.lesson_id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`badge ${lesson.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                                        lesson.priority === 'Important' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                        {lesson.priority}
                                                    </span>
                                                    <span className="badge bg-gray-100 text-gray-800">
                                                        {lesson.lesson_category}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {lesson.lesson_type}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">{lesson.lesson_title}</h3>
                                                <p className="text-sm text-gray-700">{lesson.lesson_description}</p>
                                            </div>
                                            {lesson.upvotes > 0 && (
                                                <div className="ml-4 text-center">
                                                    <div className="text-2xl">👍</div>
                                                    <div className="text-sm font-medium text-gray-600">{lesson.upvotes}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📚</div>
                                <p className="text-gray-500 mb-4">No lessons recorded yet</p>
                                <p className="text-sm text-gray-600 mb-6">
                                    After the trip, add lessons learned to help future trip planning
                                </p>
                                <button
                                    onClick={() => setShowLessonModal(true)}
                                    className="btn-primary"
                                >
                                    + Add First Lesson
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'equipment' && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">🎒 Equipment Needed</h2>
                            <button
                                onClick={() => setShowEquipmentModal(true)}
                                className="btn-primary text-sm"
                            >
                                + Add Equipment
                            </button>
                        </div>

                        {trip.equipment_needs && trip.equipment_needs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Category</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Item</th>
                                            <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Qty</th>
                                            <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Crew Owned</th>
                                            <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Rental</th>
                                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Source</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trip.equipment_needs.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-100">
                                                <td className="py-3 px-2">
                                                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                                        {item.equipment_category}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-sm">{item.equipment_item}</td>
                                                <td className="py-3 px-2 text-sm text-right">{item.quantity_needed}</td>
                                                <td className="py-3 px-2 text-center text-sm">
                                                    {item.crew_owned ? '✓' : '—'}
                                                </td>
                                                <td className="py-3 px-2 text-center text-sm">
                                                    {item.rental_needed ? '✓' : '—'}
                                                </td>
                                                <td className="py-3 px-2 text-sm">
                                                    {item.rental_source || '—'}
                                                    {item.rental_cost && ` ($${item.rental_cost})`}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎒</div>
                                <p className="text-gray-500 mb-4">No equipment list created yet</p>
                                <p className="text-sm text-gray-600 mb-6">
                                    Add equipment needed for this trip and check inventory availability
                                </p>
                                <button
                                    onClick={() => setShowEquipmentModal(true)}
                                    className="btn-primary"
                                >
                                    + Add Equipment Items
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODALS */}

            {/* ADD COST MODAL - Same as before */}
            {showCostModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">Add Cost Item</h3>
                        <form onSubmit={handleAddCost} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={costForm.cost_category}
                                    onChange={(e) => setCostForm({ ...costForm, cost_category: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option>Transportation</option>
                                    <option>Lodging</option>
                                    <option>Food</option>
                                    <option>Activities</option>
                                    <option>Equipment Rental</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Item Description</label>
                                <input
                                    type="text"
                                    value={costForm.cost_item}
                                    onChange={(e) => setCostForm({ ...costForm, cost_item: e.target.value })}
                                    placeholder="e.g., Gas for van"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={costForm.estimated_cost}
                                        onChange={(e) => setCostForm({ ...costForm, estimated_cost: parseFloat(e.target.value) })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={costForm.quantity}
                                        onChange={(e) => setCostForm({ ...costForm, quantity: parseInt(e.target.value) })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCostModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Cost Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD ACTIVITY MODAL - Same as before */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Add Activity</h3>
                        <form onSubmit={handleAddActivity} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={activityForm.scheduled_date}
                                    onChange={(e) => setActivityForm({ ...activityForm, scheduled_date: e.target.value })}
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
                                <input
                                    type="text"
                                    value={activityForm.activity_name}
                                    onChange={(e) => setActivityForm({ ...activityForm, activity_name: e.target.value })}
                                    placeholder="e.g., Rock Climbing at Miguel's"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={activityForm.activity_description}
                                    onChange={(e) => setActivityForm({ ...activityForm, activity_description: e.target.value })}
                                    placeholder="Details about the activity..."
                                    rows="3"
                                    className="input-field"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={activityForm.scheduled_start_time}
                                        onChange={(e) => setActivityForm({ ...activityForm, scheduled_start_time: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={activityForm.scheduled_end_time}
                                        onChange={(e) => setActivityForm({ ...activityForm, scheduled_end_time: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    value={activityForm.location}
                                    onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })}
                                    placeholder="e.g., Red River Gorge"
                                    className="input-field"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowActivityModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Activity
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD LESSON MODAL - Same as before */}
            {showLessonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Add Lesson Learned</h3>
                        <form onSubmit={handleAddLesson} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={lessonForm.lesson_category}
                                        onChange={(e) => setLessonForm({ ...lessonForm, lesson_category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option>Safety</option>
                                        <option>Planning</option>
                                        <option>Equipment</option>
                                        <option>Communication</option>
                                        <option>Logistics</option>
                                        <option>Budget</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={lessonForm.lesson_type}
                                        onChange={(e) => setLessonForm({ ...lessonForm, lesson_type: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option>What Went Well</option>
                                        <option>What Could Improve</option>
                                        <option>Best Practice</option>
                                        <option>Mistake to Avoid</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    value={lessonForm.priority}
                                    onChange={(e) => setLessonForm({ ...lessonForm, priority: e.target.value })}
                                    className="input-field"
                                    required
                                >
                                    <option>Critical</option>
                                    <option>Important</option>
                                    <option>Nice-to-have</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                                <input
                                    type="text"
                                    value={lessonForm.lesson_title}
                                    onChange={(e) => setLessonForm({ ...lessonForm, lesson_title: e.target.value })}
                                    placeholder="e.g., Always do partner checks before every climb"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={lessonForm.lesson_description}
                                    onChange={(e) => setLessonForm({ ...lessonForm, lesson_description: e.target.value })}
                                    placeholder="Provide details about what happened and why this lesson is important..."
                                    rows="4"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowLessonModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Lesson
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD EQUIPMENT MODAL - NEW VERSION WITH INVENTORY INTEGRATION */}
            {showEquipmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Add Equipment</h3>

                        {loadingInventory && (
                            <div className="text-center py-4">
                                <p className="text-gray-600">Loading inventory...</p>
                            </div>
                        )}

                        <form onSubmit={handleAddEquipment} className="space-y-4">
                            {/* NEW: Category Filter */}
                            {inventoryEquipment.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Filter by Category
                                    </label>
                                    <select
                                        value={equipmentForm.filter_category}
                                        onChange={(e) => setEquipmentForm({
                                            ...equipmentForm,
                                            filter_category: e.target.value,
                                            inventory_item_id: '' // Reset selection when filter changes
                                        })}
                                        className="input-field"
                                    >
                                        <option>All</option>
                                        <option>Tents & Shelter</option>
                                        <option>Sleeping Gear</option>
                                        <option>Backpacks</option>
                                        <option>Cooking Equipment</option>
                                        <option>Backpacking Stoves</option>
                                        <option>Cookware</option>
                                        <option>Coolers & Storage</option>
                                        <option>Water & Hydration</option>
                                        <option>Lighting</option>
                                        <option>Safety Equipment</option>
                                        <option>Winter Gear</option>
                                        <option>Hiking Accessories</option>
                                        <option>Tools & Repair</option>
                                        <option>Other</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {equipmentForm.filter_category === 'All'
                                            ? `Showing all ${inventoryEquipment.length} items`
                                            : `Showing ${getFilteredInventory().length} items in ${equipmentForm.filter_category}`
                                        }
                                    </p>
                                </div>
                            )}

                            {/* NEW: Inventory Selection with Filtered Items */}
                            {inventoryEquipment.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select from Inventory
                                    </label>
                                    <select
                                        value={equipmentForm.inventory_item_id}
                                        onChange={handleInventorySelect}
                                        className="input-field"
                                    >
                                        <option value="">-- Or enter manually below --</option>
                                        {getFilteredInventory().map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.item_name} ({item.item_number}) - {item.quantity_available} available
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select equipment from your inventory or enter manually
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={equipmentForm.equipment_category}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_category: e.target.value })}
                                    className="input-field"
                                    required
                                    disabled={equipmentForm.use_inventory && equipmentForm.inventory_item_id}
                                >
                                    <option>Tents & Shelter</option>
                                    <option>Sleeping Gear</option>
                                    <option>Backpacks</option>
                                    <option>Cooking Equipment</option>
                                    <option>Backpacking Stoves</option>
                                    <option>Cookware</option>
                                    <option>Coolers & Storage</option>
                                    <option>Water & Hydration</option>
                                    <option>Lighting</option>
                                    <option>Safety Equipment</option>
                                    <option>Winter Gear</option>
                                    <option>Hiking Accessories</option>
                                    <option>Tools & Repair</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Item</label>
                                <input
                                    type="text"
                                    value={equipmentForm.equipment_item}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_item: e.target.value })}
                                    placeholder="e.g., Climbing Harness"
                                    className="input-field"
                                    required
                                    disabled={equipmentForm.use_inventory && equipmentForm.inventory_item_id}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={equipmentForm.quantity_needed}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, quantity_needed: parseInt(e.target.value) })}
                                    className="input-field"
                                    required
                                />
                                {equipmentForm.inventory_item_id && (() => {
                                    const selectedItem = inventoryEquipment.find(item => item.id === parseInt(equipmentForm.inventory_item_id))
                                    if (selectedItem && equipmentForm.quantity_needed > selectedItem.quantity_available) {
                                        return (
                                            <p className="text-xs text-red-600 mt-1">
                                                ⚠️ Only {selectedItem.quantity_available} available in inventory
                                            </p>
                                        )
                                    }
                                    return null
                                })()}
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={equipmentForm.crew_owned}
                                        onChange={(e) => setEquipmentForm({ ...equipmentForm, crew_owned: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Crew Owned</span>
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={equipmentForm.rental_needed}
                                        onChange={(e) => setEquipmentForm({ ...equipmentForm, rental_needed: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Rental Needed</span>
                                </label>
                            </div>

                            {equipmentForm.rental_needed && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rental Source</label>
                                        <input
                                            type="text"
                                            value={equipmentForm.rental_source}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, rental_source: e.target.value })}
                                            placeholder="e.g., Red River Outdoors"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rental Cost</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={equipmentForm.rental_cost || ''}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, rental_cost: parseFloat(e.target.value) })}
                                            placeholder="0.00"
                                            className="input-field"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowEquipmentModal(false)}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Equipment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TripDetails