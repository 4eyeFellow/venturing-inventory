import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tripAPI, templatesAPI } from '../services/api'

function CreateTrip() {
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [templates, setTemplates] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Form data
    const [formData, setFormData] = useState({
        // Step 2: Basic Information
        trip_name: '',
        destination: '',
        state_country: '',
        start_date: '',
        end_date: '',
        duration_days: 0,
        duration_hours: 0,
        num_participants: 10,
        leaders: [{ name: '', role: 'Primary Leader', email: '', phone: '' }],
        venue_contacts: [],  // Array of venue contacts
        venue_contacts: [],

        // Emergency contact
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_email: '',
        emergency_contact_relationship: '',

        // Step 3: Budget
        costs: [],
        emergency_fund: 100,
        total_cost: 0,
        cost_per_person: 0,
        funding_source: 'Participant payments',

        // Step 4: Equipment & Logistics
        equipment: [],
        num_vehicles: 1,
        drivers: [],

        // Additional fields
        trip_type: '',
        trip_summary: '',
        notes: '',
        created_by: 'zgrant4056@gmail.com' // TODO: Get from auth
    })

    // Load templates on mount
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const response = await templatesAPI.getAll()
                if (response.data.success) {
                    setTemplates(response.data.data)
                }
            } catch (err) {
                console.error('Error loading templates:', err)
            }
        }
        loadTemplates()
    }, [])

    // Handle template selection
    const handleTemplateSelect = async (template) => {
        setSelectedTemplate(template)

        // Pre-fill form with template data
        const budgetItems = template.typical_budget ? JSON.parse(template.typical_budget) : []

        setFormData(prev => ({
            ...prev,
            trip_type: template.template_type,
            duration_days: template.typical_duration_days || 0,
            duration_hours: template.typical_duration_hours || 0,
            costs: budgetItems,
            emergency_fund: 100
        }))

        setCurrentStep(2)
    }

    // Handle input change
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Auto-calculate duration when dates change
        if (field === 'start_date' || field === 'end_date') {
            const newData = { ...formData, [field]: value }
            if (newData.start_date && newData.end_date) {
                const start = new Date(newData.start_date)
                const end = new Date(newData.end_date)
                const diffTime = Math.abs(end - start)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                setFormData(prev => ({ ...prev, duration_days: diffDays }))
            }
        }
    }

    // Add leader
    const addLeader = () => {
        setFormData(prev => ({
            ...prev,
            leaders: [...prev.leaders, { name: '', role: 'Co-Leader', email: '', phone: '' }]
        }))
    }

    // Update leader
    const updateLeader = (index, field, value) => {
        const newLeaders = [...formData.leaders]
        newLeaders[index][field] = value
        setFormData(prev => ({ ...prev, leaders: newLeaders }))
    }

    // Remove leader
    const removeLeader = (index) => {
        const newLeaders = formData.leaders.filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, leaders: newLeaders }))
    }

    // Add cost item
    const addCostItem = (category = '') => {
        setFormData(prev => ({
            ...prev,
            costs: [...prev.costs, { category: category, item: '', estimated_cost: 0, quantity: 1 }]
        }))
    }

    // Update cost item
    const updateCostItem = (index, field, value) => {
        const newCosts = [...formData.costs]
        newCosts[index][field] = value
        setFormData(prev => ({ ...prev, costs: newCosts }))
        calculateTotalCost()
    }

    // Remove cost item
    const removeCostItem = (index) => {
        const newCosts = formData.costs.filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, costs: newCosts }))
        calculateTotalCost()
    }

    // Calculate total cost
    const calculateTotalCost = () => {
        setTimeout(() => {
            const costsTotal = formData.costs.reduce((sum, cost) => {
                return sum + (parseFloat(cost.estimated_cost) || 0) * (parseInt(cost.quantity) || 1)
            }, 0)

            const total = costsTotal + parseFloat(formData.emergency_fund || 0)
            const perPerson = formData.num_participants > 0 ? total / formData.num_participants : 0

            setFormData(prev => ({
                ...prev,
                total_cost: Math.round(total * 100) / 100,
                cost_per_person: Math.round(perPerson * 100) / 100
            }))
        }, 100)
    }

    // Add equipment item
    const addEquipmentItem = () => {
        setFormData(prev => ({
            ...prev,
            equipment: [...prev.equipment, { item: '', quantity: 1, crew_owned: true }]
        }))
    }

    // Update equipment item
    const updateEquipmentItem = (index, field, value) => {
        const newEquipment = [...formData.equipment]
        newEquipment[index][field] = value
        setFormData(prev => ({ ...prev, equipment: newEquipment }))
    }

    // Remove equipment item
    const removeEquipmentItem = (index) => {
        const newEquipment = formData.equipment.filter((_, i) => i !== index)
        setFormData(prev => ({ ...prev, equipment: newEquipment }))
    }

    // Navigation
    const nextStep = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // Submit form
    const handleSubmit = async () => {
        try {
            setLoading(true)
            setError(null)

            // Prepare trip data
            const tripData = {
                trip_name: formData.trip_name,
                trip_type: formData.trip_type,
                destination: formData.destination,
                state_country: formData.state_country,
                start_date: formData.start_date,
                end_date: formData.end_date,
                duration_days: formData.duration_days,
                duration_hours: formData.duration_hours,
                num_participants: formData.num_participants,
                total_cost: formData.total_cost,
                cost_per_person: formData.cost_per_person,
                funding_source: formData.funding_source,
                trip_summary: formData.trip_summary,
                notes: formData.notes,
                created_by: formData.created_by,
                trip_status: 'Planned'
            }

            console.log('Creating trip:', tripData)

            const response = await tripAPI.create(tripData)
            console.log('Trip created:', response.data)

            if (response.data.success) {
                // Success! Redirect to trip details or trip list
                alert('Trip created successfully!')
                navigate('/trips')
            }

            setLoading(false)
        } catch (err) {
            console.error('Error creating trip:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    // Get trip icon
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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
                    <p className="mt-1 text-gray-600">
                        {currentStep === 1 && 'Choose a trip template to get started'}
                        {currentStep === 2 && 'Enter basic trip information'}
                        {currentStep === 3 && 'Plan your budget'}
                        {currentStep === 4 && 'List equipment and logistics'}
                        {currentStep === 5 && 'Review and create trip'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/trips')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕ Cancel
                </button>
            </div>

            {/* Progress Bar */}
            {currentStep > 1 && (
                <div className="card">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Step {currentStep} of 5
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round((currentStep / 5) * 100)}% Complete
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / 5) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <span className="text-2xl mr-3">⚠️</span>
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-sm text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 1: Choose Template */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Select the type of trip you want to plan:
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {templates.map((template) => (
                                <button
                                    key={template.template_id}
                                    onClick={() => handleTemplateSelect(template)}
                                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all text-left"
                                >
                                    <div className="text-4xl mb-3">{getTripIcon(template.template_type)}</div>
                                    <h3 className="font-bold text-gray-900 mb-2">{template.template_type}</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>{template.typical_duration_days > 0 ? `${template.typical_duration_days} days` : `${template.typical_duration_hours} hours`}</p>
                                        <p>${template.cost_range_min}-${template.cost_range_max}</p>
                                        <p className="capitalize">{template.complexity_level} complexity</p>
                                    </div>
                                    <div className="mt-4">
                                        <span className="text-primary font-medium text-sm">Select →</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>

                    {/* Trip Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trip Name *
                        </label>
                        <input
                            type="text"
                            value={formData.trip_name}
                            onChange={(e) => handleChange('trip_name', e.target.value)}
                            placeholder="Example: Red River Gorge Spring Break 2025"
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Destination */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Destination *
                        </label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => handleChange('destination', e.target.value)}
                            placeholder="City or location name"
                            className="input-field"
                            required
                        />
                    </div>

                    {/* State/Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            State/Country *
                        </label>
                        <input
                            type="text"
                            value={formData.state_country}
                            onChange={(e) => handleChange('state_country', e.target.value)}
                            placeholder="e.g., Kentucky or United Kingdom"
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => handleChange('start_date', e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date *
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => handleChange('end_date', e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    </div>

                    {/* Duration (auto-calculated) */}
                    {formData.duration_days > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-900">
                                Duration: <span className="font-semibold">{formData.duration_days} days</span> (calculated automatically)
                            </p>
                        </div>
                    )}

                    {/* Number of Participants */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Number of Participants
                        </label>
                        <input
                            type="number"
                            value={formData.num_participants}
                            onChange={(e) => handleChange('num_participants', parseInt(e.target.value))}
                            min="1"
                            className="input-field"
                        />
                    </div>

                    {/* Trip Leaders */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trip Leaders (Add at least one)
                        </label>

                        {formData.leaders.map((leader, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={leader.name}
                                            onChange={(e) => updateLeader(index, 'name', e.target.value)}
                                            placeholder="Jane Doe"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                                        <select
                                            value={leader.role}
                                            onChange={(e) => updateLeader(index, 'role', e.target.value)}
                                            className="input-field"
                                        >
                                            <option>Primary Leader</option>
                                            <option>Co-Leader</option>
                                            <option>Assistant</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={leader.email}
                                            onChange={(e) => updateLeader(index, 'email', e.target.value)}
                                            placeholder="jane@evansville.edu"
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={leader.phone}
                                            onChange={(e) => updateLeader(index, 'phone', e.target.value)}
                                            placeholder="(812) 555-0100"
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                {index > 0 && (
                                    <button
                                        onClick={() => removeLeader(index)}
                                        className="text-sm text-red-600 hover:text-red-800 mt-2"
                                    >
                                        ✕ Remove Leader
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={addLeader}
                            className="btn-secondary text-sm"
                        >
                            + Add Another Leader
                        </button>
                    </div>


                    {/* Venue Contacts Section */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                                <span className="text-2xl mr-2">📍</span>
                                Venue Contacts
                            </h4>
                            <button
                                type="button"
                                onClick={() => {
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
                                    });
                                }}
                                className="btn-secondary text-sm"
                            >
                                + Add Venue
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Contact information for campsites, lodges, activity providers, etc.
                        </p>

                        {formData.venue_contacts.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <p className="text-gray-500">No venue contacts added yet</p>
                                <p className="text-sm text-gray-400 mt-1">Click "Add Venue" to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.venue_contacts.map((venue, index) => (
                                    <div key={index} className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-medium text-gray-900">Venue #{index + 1}</h5>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        venue_contacts: formData.venue_contacts.filter((_, i) => i !== index)
                                                    });
                                                }}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Venue Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={venue.venue_name}
                                                    onChange={(e) => {
                                                        const updated = [...formData.venue_contacts];
                                                        updated[index].venue_name = e.target.value;
                                                        setFormData({ ...formData, venue_contacts: updated });
                                                    }}
                                                    placeholder="e.g., Red River Gorge Campground"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Venue Type
                                                </label>
                                                <select
                                                    value={venue.venue_type}
                                                    onChange={(e) => {
                                                        const updated = [...formData.venue_contacts];
                                                        updated[index].venue_type = e.target.value;
                                                        setFormData({ ...formData, venue_contacts: updated });
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Contact Person
                                                </label>
                                                <input
                                                    type="text"
                                                    value={venue.contact_person}
                                                    onChange={(e) => {
                                                        const updated = [...formData.venue_contacts];
                                                        updated[index].contact_person = e.target.value;
                                                        setFormData({ ...formData, venue_contacts: updated });
                                                    }}
                                                    placeholder="Contact name"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={venue.contact_phone}
                                                    onChange={(e) => {
                                                        const formatted = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                        const display = formatted.length <= 3 ? formatted :
                                                            formatted.length <= 6 ? `(${formatted.slice(0, 3)}) ${formatted.slice(3)}` :
                                                                `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`;
                                                        const updated = [...formData.venue_contacts];
                                                        updated[index].contact_phone = display;
                                                        setFormData({ ...formData, venue_contacts: updated });
                                                    }}
                                                    placeholder="(555) 123-4567"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    value={venue.contact_email}
                                                    onChange={(e) => {
                                                        const updated = [...formData.venue_contacts];
                                                        updated[index].contact_email = e.target.value;
                                                        setFormData({ ...formData, venue_contacts: updated });
                                                    }}
                                                    placeholder="venue@example.com"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={venue.address}
                                                    onChange={(e) => {
                                                        const updated = [...formData.venue_contacts];
                                                        updated[index].address = e.target.value;
                                                        setFormData({ ...formData, venue_contacts: updated });
                                                    }}
                                                    placeholder="Full address"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Notes
                                                </label>
                                                <textarea
                                                    value={venue.notes}
                                                    onChange={(e) => {
                                                        const updated = [...formData.venue_contacts];
                                                        updated[index].notes = e.target.value;
                                                        setFormData({ ...formData, venue_contacts: updated });
                                                    }}
                                                    placeholder="Reservation info, special instructions, etc."
                                                    rows="2"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Emergency Contact Section */}
                    <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <span className="text-2xl mr-2">🚨</span>
                            Emergency Contact
                        </h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Back-home contact person in case of emergency during the trip
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.emergency_contact_name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergency_contact_name: e.target.value
                                    })}
                                    placeholder="Enter emergency contact name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Relationship
                                </label>
                                <input
                                    type="text"
                                    value={formData.emergency_contact_relationship}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergency_contact_relationship: e.target.value
                                    })}
                                    placeholder="Parent, Advisor, Dean, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.emergency_contact_phone}
                                    onChange={(e) => {
                                        const formatted = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        const display = formatted.length <= 3 ? formatted :
                                            formatted.length <= 6 ? `(${formatted.slice(0, 3)}) ${formatted.slice(3)}` :
                                                `(${formatted.slice(0, 3)}) ${formatted.slice(3, 6)}-${formatted.slice(6)}`;
                                        setFormData({
                                            ...formData,
                                            emergency_contact_phone: display
                                        });
                                    }}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.emergency_contact_email}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergency_contact_email: e.target.value
                                    })}
                                    placeholder="emergency@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-4 border-t">
                        <button onClick={prevStep} className="btn-secondary">
                            ← Back
                        </button>
                        <button onClick={nextStep} className="btn-primary">
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Budget Planning */}
            {currentStep === 3 && (
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Budget Planning</h2>

                    <p className="text-sm text-gray-600">
                        {selectedTemplate && `Template pre-filled with typical ${selectedTemplate.template_type} costs. Adjust as needed.`}
                    </p>

                    {/* Cost Categories */}
                    <div className="space-y-4">
                        {['Transportation', 'Lodging', 'Food', 'Activities'].map((category) => (
                            <div key={category}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">{category}</h3>
                                    <button
                                        onClick={() => addCostItem(category)}
                                        className="text-sm text-primary hover:text-primary-dark"
                                    >
                                        + Add {category} Item
                                    </button>
                                </div>

                                {formData.costs.filter(c => c.category === category).map((cost, index) => {
                                    const actualIndex = formData.costs.findIndex(c => c === cost)
                                    return (
                                        <div key={actualIndex} className="grid grid-cols-12 gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={cost.item}
                                                onChange={(e) => updateCostItem(actualIndex, 'item', e.target.value)}
                                                placeholder="Item name"
                                                className="input-field col-span-5"
                                            />
                                            <input
                                                type="number"
                                                value={cost.estimated_cost}
                                                onChange={(e) => updateCostItem(actualIndex, 'estimated_cost', parseFloat(e.target.value))}
                                                placeholder="Cost"
                                                className="input-field col-span-3"
                                                step="0.01"
                                            />
                                            <input
                                                type="number"
                                                value={cost.quantity}
                                                onChange={(e) => updateCostItem(actualIndex, 'quantity', parseInt(e.target.value))}
                                                placeholder="Qty"
                                                className="input-field col-span-2"
                                                min="1"
                                            />
                                            <div className="col-span-2 flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    ${((cost.estimated_cost || 0) * (cost.quantity || 1)).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => removeCostItem(actualIndex)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Emergency Fund */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Fund
                        </label>
                        <input
                            type="number"
                            value={formData.emergency_fund}
                            onChange={(e) => {
                                handleChange('emergency_fund', parseFloat(e.target.value))
                                calculateTotalCost()
                            }}
                            className="input-field"
                            step="0.01"
                        />
                    </div>

                    {/* Total Cost Summary */}
                    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-lg">
                                <span className="font-semibold">Total Estimated Cost:</span>
                                <span className="font-bold text-primary">${formData.total_cost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Cost per person ({formData.num_participants} participants):</span>
                                <span className="font-semibold">${formData.cost_per_person.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Funding Source */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Funding Source
                        </label>
                        <div className="space-y-2">
                            {['Participant payments', 'Crew budget', 'Fundraising', 'Grants'].map((source) => (
                                <label key={source} className="flex items-center">
                                    <input
                                        type="radio"
                                        name="funding_source"
                                        value={source}
                                        checked={formData.funding_source === source}
                                        onChange={(e) => handleChange('funding_source', e.target.value)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">{source}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t">
                        <button onClick={prevStep} className="btn-secondary">
                            ← Back
                        </button>
                        <button onClick={nextStep} className="btn-primary">
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 4: Equipment & Logistics */}
            {currentStep === 4 && (
                <div className="card space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Equipment & Logistics</h2>

                    {/* Equipment */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Equipment Needed
                            </label>
                            <button
                                onClick={addEquipmentItem}
                                className="btn-secondary text-sm"
                            >
                                + Add Equipment
                            </button>
                        </div>

                        {formData.equipment.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No equipment added yet</p>
                        ) : (
                            <div className="space-y-2">
                                {formData.equipment.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2">
                                        <input
                                            type="text"
                                            value={item.item}
                                            onChange={(e) => updateEquipmentItem(index, 'item', e.target.value)}
                                            placeholder="Equipment item"
                                            className="input-field col-span-6"
                                        />
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateEquipmentItem(index, 'quantity', parseInt(e.target.value))}
                                            placeholder="Qty"
                                            className="input-field col-span-2"
                                            min="1"
                                        />
                                        <label className="col-span-3 flex items-center text-sm">
                                            <input
                                                type="checkbox"
                                                checked={item.crew_owned}
                                                onChange={(e) => updateEquipmentItem(index, 'crew_owned', e.target.checked)}
                                                className="mr-2"
                                            />
                                            Crew owned
                                        </label>
                                        <button
                                            onClick={() => removeEquipmentItem(index)}
                                            className="col-span-1 text-red-600 hover:text-red-800"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Trip Summary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trip Summary (Optional)
                        </label>
                        <textarea
                            value={formData.trip_summary}
                            onChange={(e) => handleChange('trip_summary', e.target.value)}
                            placeholder="Brief description of the trip..."
                            rows="3"
                            className="input-field"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Planning Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Any additional notes for planning..."
                            rows="3"
                            className="input-field"
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4 border-t">
                        <button onClick={prevStep} className="btn-secondary">
                            ← Back
                        </button>
                        <button onClick={nextStep} className="btn-primary">
                            Continue →
                        </button>
                    </div>
                </div>
            )}

            {/* Step 5: Review & Create */}
            {currentStep === 5 && (
                <div className="space-y-4">
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Review Your Trip</h2>

                        {/* Basic Information */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">✓ Basic Information</h3>
                                <button onClick={() => setCurrentStep(2)} className="text-sm text-primary hover:underline">
                                    Edit
                                </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                                <p><span className="font-medium">Name:</span> {formData.trip_name}</p>
                                <p><span className="font-medium">Type:</span> {formData.trip_type}</p>
                                <p><span className="font-medium">Destination:</span> {formData.destination}, {formData.state_country}</p>
                                <p><span className="font-medium">Dates:</span> {formData.start_date} to {formData.end_date} ({formData.duration_days} days)</p>
                                <p><span className="font-medium">Participants:</span> {formData.num_participants}</p>
                                <p><span className="font-medium">Leaders:</span> {formData.leaders.map(l => l.name).filter(Boolean).join(', ') || 'None added'}</p>
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">✓ Budget</h3>
                                <button onClick={() => setCurrentStep(3)} className="text-sm text-primary hover:underline">
                                    Edit
                                </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                                <p><span className="font-medium">Total Cost:</span> ${formData.total_cost.toFixed(2)}</p>
                                <p><span className="font-medium">Per Person:</span> ${formData.cost_per_person.toFixed(2)}</p>
                                <p><span className="font-medium">Funding:</span> {formData.funding_source}</p>
                                <p><span className="font-medium">Cost Items:</span> {formData.costs.length} items</p>
                            </div>
                        </div>

                        {formData.venue_contacts.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 flex items-center">
                                        <span className="mr-2">📍</span>
                                        Venue Contacts
                                    </h3>
                                    <button onClick={() => setCurrentStep(2)} className="text-sm text-primary hover:underline">
                                        Edit
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.venue_contacts.map((venue, idx) => (
                                        <div key={idx} className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                                            <p className="font-medium text-gray-900 mb-2">{venue.venue_name}</p>
                                            <div className="text-sm space-y-1">
                                                <p><span className="font-medium">Type:</span> {venue.venue_type}</p>
                                                {venue.contact_person && <p><span className="font-medium">Contact:</span> {venue.contact_person}</p>}
                                                {venue.contact_phone && <p><span className="font-medium">Phone:</span> {venue.contact_phone}</p>}
                                                {venue.contact_email && <p><span className="font-medium">Email:</span> {venue.contact_email}</p>}
                                                {venue.address && <p><span className="font-medium">Address:</span> {venue.address}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(formData.emergency_contact_name || formData.emergency_contact_phone) && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900 flex items-center">
                                        <span className="mr-2">🚨</span>
                                        Emergency Contact
                                    </h3>
                                    <button onClick={() => setCurrentStep(2)} className="text-sm text-primary hover:underline">
                                        Edit
                                    </button>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 space-y-1 text-sm border-2 border-red-200">
                                    {formData.emergency_contact_name && (
                                        <p><span className="font-medium">Name:</span> {formData.emergency_contact_name}</p>
                                    )}
                                    {formData.emergency_contact_relationship && (
                                        <p><span className="font-medium">Relationship:</span> {formData.emergency_contact_relationship}</p>
                                    )}
                                    {formData.emergency_contact_phone && (
                                        <p><span className="font-medium">Phone:</span> {formData.emergency_contact_phone}</p>
                                    )}
                                    {formData.emergency_contact_email && (
                                        <p><span className="font-medium">Email:</span> {formData.emergency_contact_email}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Equipment */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-gray-900">✓ Equipment & Notes</h3>
                                <button onClick={() => setCurrentStep(4)} className="text-sm text-primary hover:underline">
                                    Edit
                                </button>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                                <p><span className="font-medium">Equipment Items:</span> {formData.equipment.length}</p>
                                {formData.trip_summary && (
                                    <p><span className="font-medium">Summary:</span> {formData.trip_summary}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Create Button */}
                    <div className="card">
                        <div className="flex items-center justify-between">
                            <button onClick={prevStep} className="btn-secondary">
                                ← Back
                            </button>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary px-8"
                            >
                                {loading ? '⏳ Creating...' : '✓ Create Trip'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateTrip
