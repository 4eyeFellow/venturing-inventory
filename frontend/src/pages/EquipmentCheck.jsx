import { useState, useEffect } from 'react'

function EquipmentChecker() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  })
  const [equipmentList, setEquipmentList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkingAvailability, setCheckingAvailability] = useState({})
  const [availabilityResults, setAvailabilityResults] = useState({})
  
  // Updated categories to match your inventory system
  const categories = [
    'All',
    'Tents & Shelter',
    'Sleeping Gear',
    'Backpacks',
    'Cooking Equipment',
    'Backpacking Stoves',
    'Cookware',
    'Coolers & Storage',
    'Water & Hydration',
    'Lighting',
    'Safety Equipment',
    'Winter Gear',
    'Hiking Accessories',
    'Tools & Repair',
    'Other'
  ]
  
  // Fetch equipment from your inventory system
  useEffect(() => {
    fetchEquipment()
  }, [])
  
  const fetchEquipment = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Call your inventory system API
      const response = await fetch('http://localhost:3001/api/equipment')
      
      if (!response.ok) {
        throw new Error('Failed to fetch equipment from inventory system')
      }
      
      const data = await response.json()
      console.log('Equipment loaded from inventory:', data)
      
      // Transform your inventory data format to match what we need
      const formattedEquipment = data.map(item => ({
        sku: item.item_number,
        name: item.item_name,
        category: item.category,
        in_stock: item.quantity_available || item.quantity_total || 0,
        condition: item.condition,
        location: item.location,
        description: item.description,
        requiresInspection: item.requires_inspection,
        purchasePrice: item.purchase_price,
        notes: item.notes
      }))
      
      setEquipmentList(formattedEquipment)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching equipment:', err)
      setError(err.message)
      setLoading(false)
    }
  }
  
  // Filter equipment
  const filteredEquipment = equipmentList.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })
  
  // Check availability for specific item
  const checkAvailability = async (item, quantity) => {
    setCheckingAvailability(prev => ({ ...prev, [item.sku]: true }))
    
    try {
      // Check if requested quantity is available
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const available = item.in_stock >= quantity
      const result = {
        sku: item.sku,
        name: item.name,
        requested: quantity,
        available: item.in_stock,
        can_fulfill: available,
        status: available ? 'Available' : 'Insufficient Stock',
        alternative: !available ? 'Consider renting or borrowing from another crew' : null,
        condition: item.condition,
        location: item.location,
        requiresInspection: item.requiresInspection
      }
      
      setAvailabilityResults(prev => ({ ...prev, [item.sku]: result }))
    } catch (error) {
      console.error('Error checking availability:', error)
    } finally {
      setCheckingAvailability(prev => ({ ...prev, [item.sku]: false }))
    }
  }
  
  // Quick check for a quantity
  const [quickCheckQuantities, setQuickCheckQuantities] = useState({})
  
  const handleQuickCheck = (item) => {
    const quantity = quickCheckQuantities[item.sku] || 1
    checkAvailability(item, quantity)
  }
  
  // Get condition badge color
  const getConditionColor = (condition) => {
    const colors = {
      'Excellent': 'bg-green-100 text-green-800',
      'Good': 'bg-blue-100 text-blue-800',
      'Fair': 'bg-yellow-100 text-yellow-800',
      'Needs Repair': 'bg-red-100 text-red-800'
    }
    return colors[condition] || 'bg-gray-100 text-gray-800'
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-xl text-gray-600">Loading equipment from inventory system...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Connection Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600 mb-4">
              Make sure your Inventory System is running on http://localhost:3001
            </p>
            <button onClick={fetchEquipment} className="btn-primary">
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Equipment Availability Checker</h1>
        <p className="mt-1 text-gray-600">
          Real-time equipment availability from your inventory system
        </p>
      </div>
      
      {/* Success Banner */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <h3 className="font-semibold text-green-900">Connected to Inventory System</h3>
            <p className="text-sm text-green-800 mt-1">
              Showing real-time data from your Wood Badge Goal #3 Inventory System. 
              Found {equipmentList.length} equipment items.
            </p>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Equipment
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, SKU, or description..."
              className="input-field"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Start Date
              </label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({...dateRange, start_date: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip End Date
              </label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({...dateRange, end_date: e.target.value})}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Equipment List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Available Equipment ({filteredEquipment.length} items)
          </h2>
          <button 
            onClick={fetchEquipment}
            className="btn-secondary text-sm"
          >
            🔄 Refresh
          </button>
        </div>
        
        {filteredEquipment.length > 0 ? (
          <div className="space-y-4">
            {filteredEquipment.map((item) => {
              const availability = availabilityResults[item.sku]
              const isChecking = checkingAvailability[item.sku]
              
              return (
                <div key={item.sku} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className="badge bg-gray-100 text-gray-800 text-xs">
                          {item.category}
                        </span>
                        <span className={`badge text-xs ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                        <span className="text-xs text-gray-500">
                          SKU: {item.sku}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm">
                        <div>
                          <span className="text-gray-600">In Stock:</span>
                          <span className={`ml-2 font-semibold ${
                            item.in_stock > 10 ? 'text-green-600' :
                            item.in_stock > 5 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {item.in_stock} units
                          </span>
                        </div>
                        
                        {item.location && (
                          <div>
                            <span className="text-gray-600">Location:</span>
                            <span className="ml-2 font-medium">{item.location}</span>
                          </div>
                        )}
                        
                        {item.requiresInspection && (
                          <span className="badge bg-yellow-100 text-yellow-800 text-xs">
                            ⚠️ Requires Inspection
                          </span>
                        )}
                        
                        {availability && (
                          <div className="flex items-center space-x-2">
                            <span className={`badge ${
                              availability.can_fulfill ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {availability.status}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {availability && (
                        <div className="mt-3 bg-gray-50 rounded p-3 text-sm">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-gray-600">Requested:</span>
                              <span className="ml-2 font-semibold">{availability.requested}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Available:</span>
                              <span className="ml-2 font-semibold">{availability.available}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Remaining:</span>
                              <span className="ml-2 font-semibold">
                                {Math.max(0, availability.available - availability.requested)}
                              </span>
                            </div>
                          </div>
                          {!availability.can_fulfill && (
                            <p className="text-xs text-red-600 mt-2">{availability.alternative}</p>
                          )}
                        </div>
                      )}
                      
                      {item.notes && (
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Notes:</strong> {item.notes}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={quickCheckQuantities[item.sku] || 1}
                        onChange={(e) => setQuickCheckQuantities({
                          ...quickCheckQuantities,
                          [item.sku]: parseInt(e.target.value) || 1
                        })}
                        className="input-field w-20 text-center"
                        placeholder="Qty"
                      />
                      <button
                        onClick={() => handleQuickCheck(item)}
                        disabled={isChecking}
                        className="btn-primary text-sm"
                      >
                        {isChecking ? '⏳ Checking...' : '✓ Check'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 mb-2">No equipment found matching your search</p>
            {equipmentList.length === 0 && (
              <p className="text-sm text-gray-600">
                Add items to your inventory system to see them here
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">🎒</div>
            <p className="text-2xl font-bold text-gray-900">{equipmentList.length}</p>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-2xl font-bold text-green-600">
              {equipmentList.filter(item => item.in_stock > 10).length}
            </p>
            <p className="text-sm text-gray-600">High Stock</p>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-2xl font-bold text-yellow-600">
              {equipmentList.filter(item => item.in_stock > 0 && item.in_stock <= 5).length}
            </p>
            <p className="text-sm text-gray-600">Low Stock</p>
          </div>
        </div>
        
        <div className="card">
          <div className="text-center">
            <div className="text-3xl mb-2">❌</div>
            <p className="text-2xl font-bold text-red-600">
              {equipmentList.filter(item => item.in_stock === 0).length}
            </p>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EquipmentChecker
