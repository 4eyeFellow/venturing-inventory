import { useState, useEffect } from 'react'

function VendorDirectory() {
    const [vendors, setVendors] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingVendor, setEditingVendor] = useState(null)

    const [vendorForm, setVendorForm] = useState({
        vendor_name: '',
        vendor_category: 'Equipment Rental',
        contact_person: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        services_offered: '',
        pricing_notes: '',
        rating: 5,
        notes: ''
    })

    const categories = [
        'All',
        'Equipment Rental',
        'Outdoor Gear',
        'Transportation',
        'Food Service',
        'Lodging',
        'Activities Provider',
        'Emergency Services',
        'Other'
    ]

    // Map UI category names to database values
    const categoryMapping = {
        'Equipment Rental': 'Equipment Rental',
        'Outdoor Gear': 'Outfitter',
        'Transportation': 'Transportation',
        'Food Service': 'Restaurant',
        'Lodging': 'Lodging',
        'Activities Provider': 'Activity Provider',
        'Emergency Services': 'Service Partner',
        'Other': 'Other'
    }

    // Reverse mapping for loading data from database
    const reverseCategoryMapping = {
        'Equipment Rental': 'Equipment Rental',
        'Outfitter': 'Outdoor Gear',
        'Transportation': 'Transportation',
        'Restaurant': 'Food Service',
        'Lodging': 'Lodging',
        'Activity Provider': 'Activities Provider',
        'Service Partner': 'Emergency Services',
        'Campground': 'Other',
        'Climbing Gym': 'Other',
        'Other': 'Other'
    }

    useEffect(() => {
        fetchVendors()
    }, [])

    const fetchVendors = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('http://localhost:5000/api/vendors')

            if (!response.ok) {
                throw new Error('Failed to fetch vendors')
            }

            const data = await response.json()
            
            // Map database category values to UI-friendly names
            const mappedVendors = (data.data || []).map(vendor => ({
                ...vendor,
                vendor_category: reverseCategoryMapping[vendor.vendor_type] || vendor.vendor_type
            }))
            
            setVendors(mappedVendors)
            setLoading(false)
        } catch (err) {
            console.error('Error fetching vendors:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    const handleAddVendor = async (e) => {
        e.preventDefault()
        try {
            // Map frontend field names to backend field names
            const vendorData = {
                vendor_name: vendorForm.vendor_name,
                vendor_type: categoryMapping[vendorForm.vendor_category] || vendorForm.vendor_category, // Map UI category to DB value
                contact_person: vendorForm.contact_person,
                phone: vendorForm.phone,
                email: vendorForm.email,
                website: vendorForm.website,
                address: vendorForm.address,
                city: vendorForm.city,
                state: vendorForm.state,
                zip: vendorForm.zip,
                services_offered: vendorForm.services_offered,
                pricing_notes: vendorForm.pricing_notes,
                quality_rating: vendorForm.rating,
                notes: vendorForm.notes,
                created_by: 'current_user' // TODO: Replace with actual user ID
            }

            const response = await fetch('http://localhost:5000/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vendorData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to add vendor')
            }

            await fetchVendors()
            setShowAddModal(false)
            resetForm()
            alert('Vendor added successfully!')
        } catch (err) {
            console.error('Error adding vendor:', err)
            alert('Failed to add vendor: ' + err.message)
        }
    }

    const handleEditVendor = async (e) => {
        e.preventDefault()
        try {
            // Map frontend field names to backend field names
            const vendorData = {
                vendor_name: vendorForm.vendor_name,
                vendor_type: categoryMapping[vendorForm.vendor_category] || vendorForm.vendor_category, // Map UI category to DB value
                contact_person: vendorForm.contact_person,
                phone: vendorForm.phone,
                email: vendorForm.email,
                website: vendorForm.website,
                address: vendorForm.address,
                city: vendorForm.city,
                state: vendorForm.state,
                zip: vendorForm.zip,
                services_offered: vendorForm.services_offered,
                pricing_notes: vendorForm.pricing_notes,
                quality_rating: vendorForm.rating,
                notes: vendorForm.notes
            }

            const response = await fetch(`http://localhost:5000/api/vendors/${editingVendor.vendor_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vendorData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update vendor')
            }

            await fetchVendors()
            setShowEditModal(false)
            setEditingVendor(null)
            resetForm()
            alert('Vendor updated successfully!')
        } catch (err) {
            console.error('Error updating vendor:', err)
            alert('Failed to update vendor: ' + err.message)
        }
    }

    const handleDeleteVendor = async (vendorId, vendorName) => {
        if (!window.confirm(`Are you sure you want to delete "${vendorName}"? This cannot be undone.`)) {
            return
        }

        try {
            const response = await fetch(`http://localhost:5000/api/vendors/${vendorId}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete vendor')
            }

            await fetchVendors()
            alert('Vendor deleted successfully!')
        } catch (err) {
            console.error('Error deleting vendor:', err)
            alert('Failed to delete vendor: ' + err.message)
        }
    }

    const openEditModal = (vendor) => {
        setEditingVendor(vendor)
        setVendorForm({
            vendor_name: vendor.vendor_name || '',
            vendor_category: vendor.vendor_category || 'Equipment Rental',
            contact_person: vendor.contact_person || '',
            phone: vendor.phone || '',
            email: vendor.email || '',
            website: vendor.website || '',
            address: vendor.address || '',
            city: vendor.city || '',
            state: vendor.state || '',
            zip: vendor.zip || '',
            services_offered: vendor.services_offered || '',
            pricing_notes: vendor.pricing_notes || '',
            rating: vendor.rating || 5,
            notes: vendor.notes || ''
        })
        setShowEditModal(true)
    }

    const resetForm = () => {
        setVendorForm({
            vendor_name: '',
            vendor_category: 'Equipment Rental',
            contact_person: '',
            phone: '',
            email: '',
            website: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            services_offered: '',
            pricing_notes: '',
            rating: 5,
            notes: ''
        })
    }

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = searchQuery === '' ||
            vendor.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.services_offered?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vendor.city?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesCategory = selectedCategory === 'All' || vendor.vendor_category === selectedCategory

        return matchesSearch && matchesCategory
    })

    const getRatingStars = (rating) => {
        return '⭐'.repeat(rating || 0)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-6xl mb-4">⏳</div>
                    <p className="text-xl text-gray-600">Loading vendors...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Directory</h1>
                    <p className="mt-1 text-gray-600">
                        Manage your trusted vendors for equipment rentals, services, and supplies
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                >
                    + Add Vendor
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Error: {error}</p>
                </div>
            )}

            {/* Search and Filter */}
            <div className="card">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Vendors
                        </label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, service, or location..."
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter by Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${selectedCategory === category
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Vendors Grid */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {filteredVendors.length} Vendor{filteredVendors.length !== 1 ? 's' : ''}
                        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                    </h2>
                </div>

                {filteredVendors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVendors.map((vendor) => (
                            <div key={vendor.vendor_id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {vendor.vendor_name}
                                        </h3>
                                        <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                                            {vendor.vendor_category}
                                        </span>
                                    </div>
                                    {vendor.rating && (
                                        <div className="text-xl">
                                            {getRatingStars(vendor.rating)}
                                        </div>
                                    )}
                                </div>

                                {vendor.services_offered && (
                                    <p className="text-sm text-gray-700 mb-3">
                                        {vendor.services_offered}
                                    </p>
                                )}

                                <div className="space-y-2 text-sm">
                                    {vendor.contact_person && (
                                        <div className="flex items-center text-gray-600">
                                            <span className="mr-2">👤</span>
                                            <span>{vendor.contact_person}</span>
                                        </div>
                                    )}

                                    {vendor.phone && (
                                        <div className="flex items-center text-gray-600">
                                            <span className="mr-2">📞</span>
                                            <a href={`tel:${vendor.phone}`} className="hover:text-primary">
                                                {vendor.phone}
                                            </a>
                                        </div>
                                    )}

                                    {vendor.email && (
                                        <div className="flex items-center text-gray-600">
                                            <span className="mr-2">📧</span>
                                            <a href={`mailto:${vendor.email}`} className="hover:text-primary">
                                                {vendor.email}
                                            </a>
                                        </div>
                                    )}

                                    {vendor.website && (
                                        <div className="flex items-center text-gray-600">
                                            <span className="mr-2">🌐</span>
                                            <a
                                                href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-primary truncate"
                                            >
                                                {vendor.website}
                                            </a>
                                        </div>
                                    )}

                                    {(vendor.city || vendor.state) && (
                                        <div className="flex items-center text-gray-600">
                                            <span className="mr-2">📍</span>
                                            <span>
                                                {vendor.city}{vendor.city && vendor.state && ', '}{vendor.state}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {vendor.pricing_notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-600">
                                            <strong>Pricing:</strong> {vendor.pricing_notes}
                                        </p>
                                    </div>
                                )}

                                {vendor.notes && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-600 italic">
                                            {vendor.notes}
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => openEditModal(vendor)}
                                        className="btn-secondary flex-1 text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteVendor(vendor.vendor_id, vendor.vendor_name)}
                                        className="btn-secondary flex-1 text-sm"
                                        style={{ background: '#dc3545', color: 'white' }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">🏪</div>
                        <p className="text-gray-500 mb-2">No vendors found</p>
                        {searchQuery || selectedCategory !== 'All' ? (
                            <p className="text-sm text-gray-600 mb-4">Try adjusting your search or filters</p>
                        ) : (
                            <p className="text-sm text-gray-600 mb-4">Add your first vendor to get started</p>
                        )}
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedCategory('All')
                            }}
                            className="btn-secondary text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* ADD VENDOR MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Add New Vendor</h3>
                        <form onSubmit={handleAddVendor} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.vendor_name}
                                        onChange={(e) => setVendorForm({ ...vendorForm, vendor_name: e.target.value })}
                                        placeholder="e.g., Red River Outdoors"
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={vendorForm.vendor_category}
                                        onChange={(e) => setVendorForm({ ...vendorForm, vendor_category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option>Equipment Rental</option>
                                        <option>Outdoor Gear</option>
                                        <option>Transportation</option>
                                        <option>Food Service</option>
                                        <option>Lodging</option>
                                        <option>Activities Provider</option>
                                        <option>Emergency Services</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rating (1-5 stars)
                                    </label>
                                    <select
                                        value={vendorForm.rating}
                                        onChange={(e) => setVendorForm({ ...vendorForm, rating: parseInt(e.target.value) })}
                                        className="input-field"
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                        <option value="4">⭐⭐⭐⭐ (4)</option>
                                        <option value="3">⭐⭐⭐ (3)</option>
                                        <option value="2">⭐⭐ (2)</option>
                                        <option value="1">⭐ (1)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.contact_person}
                                        onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                                        placeholder="John Doe"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={vendorForm.phone}
                                        onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                                        placeholder="(555) 123-4567"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={vendorForm.email}
                                        onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                                        placeholder="info@vendor.com"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.website}
                                        onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                                        placeholder="www.vendor.com"
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.address}
                                        onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                                        placeholder="123 Main St"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.city}
                                        onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                                        placeholder="Red River Gorge"
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.state}
                                        onChange={(e) => setVendorForm({ ...vendorForm, state: e.target.value })}
                                        placeholder="KY"
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Services Offered
                                    </label>
                                    <textarea
                                        value={vendorForm.services_offered}
                                        onChange={(e) => setVendorForm({ ...vendorForm, services_offered: e.target.value })}
                                        placeholder="Climbing gear rental, guided tours, equipment sales..."
                                        rows="2"
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pricing Notes
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.pricing_notes}
                                        onChange={(e) => setVendorForm({ ...vendorForm, pricing_notes: e.target.value })}
                                        placeholder="e.g., $25/day for harnesses, 10% group discount"
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={vendorForm.notes}
                                        onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                                        placeholder="Additional information, preferred vendor, special arrangements..."
                                        rows="2"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false)
                                        resetForm()
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Add Vendor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT VENDOR MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Edit Vendor</h3>
                        <form onSubmit={handleEditVendor} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.vendor_name}
                                        onChange={(e) => setVendorForm({ ...vendorForm, vendor_name: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={vendorForm.vendor_category}
                                        onChange={(e) => setVendorForm({ ...vendorForm, vendor_category: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option>Equipment Rental</option>
                                        <option>Outdoor Gear</option>
                                        <option>Transportation</option>
                                        <option>Food Service</option>
                                        <option>Lodging</option>
                                        <option>Activities Provider</option>
                                        <option>Emergency Services</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rating (1-5 stars)
                                    </label>
                                    <select
                                        value={vendorForm.rating}
                                        onChange={(e) => setVendorForm({ ...vendorForm, rating: parseInt(e.target.value) })}
                                        className="input-field"
                                    >
                                        <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                                        <option value="4">⭐⭐⭐⭐ (4)</option>
                                        <option value="3">⭐⭐⭐ (3)</option>
                                        <option value="2">⭐⭐ (2)</option>
                                        <option value="1">⭐ (1)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.contact_person}
                                        onChange={(e) => setVendorForm({ ...vendorForm, contact_person: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={vendorForm.phone}
                                        onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={vendorForm.email}
                                        onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.website}
                                        onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.address}
                                        onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.city}
                                        onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.state}
                                        onChange={(e) => setVendorForm({ ...vendorForm, state: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Services Offered
                                    </label>
                                    <textarea
                                        value={vendorForm.services_offered}
                                        onChange={(e) => setVendorForm({ ...vendorForm, services_offered: e.target.value })}
                                        rows="2"
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pricing Notes
                                    </label>
                                    <input
                                        type="text"
                                        value={vendorForm.pricing_notes}
                                        onChange={(e) => setVendorForm({ ...vendorForm, pricing_notes: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={vendorForm.notes}
                                        onChange={(e) => setVendorForm({ ...vendorForm, notes: e.target.value })}
                                        rows="2"
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false)
                                        setEditingVendor(null)
                                        resetForm()
                                    }}
                                    className="btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Vendor
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorDirectory
