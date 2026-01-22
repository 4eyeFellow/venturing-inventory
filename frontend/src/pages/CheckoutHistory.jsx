import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

function CheckoutHistory() {
    const { user } = useAuth()
    const [checkouts, setCheckouts] = useState([])
    const [equipment, setEquipment] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('active') // active, returned, overdue, all
    const [showReturnModal, setShowReturnModal] = useState(false)
    const [showCheckoutModal, setShowCheckoutModal] = useState(false)
    const [returningCheckout, setReturningCheckout] = useState(null)
    const [returnNotes, setReturnNotes] = useState('')
    const [conditionIn, setConditionIn] = useState('Good')

    // New checkout form state
    const [newCheckout, setNewCheckout] = useState({
        equipment_id: '',
        checked_out_by: '',
        expected_return_date: '',
        quantity_checked_out: 1,
        event_trip_name: '',
        condition_out: 'Good',
        checked_out_by_adult: ''
    })

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

    useEffect(() => {
        fetchCheckouts()
        fetchEquipment()
    }, [filter])

    const fetchCheckouts = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/equipment/checkouts?status=${filter}`)
            const data = await response.json()
            
            if (data.success) {
                setCheckouts(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching checkouts:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEquipment = async () => {
        try {
            const response = await fetch(`${API_URL}/equipment`)
            const data = await response.json()
            
            if (data.success) {
                setEquipment(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching equipment:', error)
        }
    }

    const handleReturnClick = (checkout) => {
        setReturningCheckout(checkout)
        setReturnNotes('')
        setConditionIn('Good')
        setShowReturnModal(true)
    }

    const handleReturn = async () => {
        try {
            const response = await fetch(`${API_URL}/equipment/checkouts/${returningCheckout.id}/return`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    return_notes: returnNotes,
                    condition_in: conditionIn
                })
            })

            const data = await response.json()

            if (data.success) {
                alert('Item returned successfully!')
                setShowReturnModal(false)
                fetchCheckouts()
            } else {
                alert('Failed to return item: ' + data.error)
            }
        } catch (error) {
            console.error('Error returning item:', error)
            alert('Failed to return item')
        }
    }

    const handleNewCheckout = async () => {
        try {
            const response = await fetch(`${API_URL}/equipment/checkouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCheckout)
            })

            const data = await response.json()

            if (data.success) {
                alert('Equipment checked out successfully!')
                setShowCheckoutModal(false)
                setNewCheckout({
                    equipment_id: '',
                    checked_out_by: '',
                    expected_return_date: '',
                    quantity_checked_out: 1,
                    event_trip_name: '',
                    condition_out: 'Good',
                    checked_out_by_adult: ''
                })
                fetchCheckouts()
            } else {
                alert('Failed to checkout item: ' + data.error)
            }
        } catch (error) {
            console.error('Error checking out item:', error)
            alert('Failed to checkout item')
        }
    }

    const isOverdue = (expectedReturnDate, status) => {
        if (!expectedReturnDate || status === 'RETURNED') return false
        return new Date(expectedReturnDate) < new Date()
    }

    const getDaysUntilDue = (expectedReturnDate) => {
        if (!expectedReturnDate) return null
        const days = Math.ceil((new Date(expectedReturnDate) - new Date()) / (1000 * 60 * 60 * 24))
        return days
    }

    const getStatusBadge = (checkout) => {
        if (checkout.status === 'RETURNED') {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Returned</span>
        }
        
        if (isOverdue(checkout.expected_return_date, checkout.status)) {
            const daysOverdue = Math.abs(getDaysUntilDue(checkout.expected_return_date))
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Overdue ({daysOverdue} days)</span>
        }

        const daysLeft = getDaysUntilDue(checkout.expected_return_date)
        if (daysLeft !== null && daysLeft <= 2) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Due Soon ({daysLeft} days)</span>
        }

        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Checked Out</span>
    }

    const filteredCheckouts = checkouts.filter(checkout => {
        switch(filter) {
            case 'active':
                return checkout.status === 'OUT'
            case 'returned':
                return checkout.status === 'RETURNED'
            case 'overdue':
                return checkout.status === 'OUT' && isOverdue(checkout.expected_return_date, checkout.status)
            default:
                return true
        }
    })

    if (loading) {
        return <div className="text-center py-12">Loading checkout history...</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Equipment Checkout System</h1>
                    <p className="mt-1 text-gray-600">Track equipment checkouts and returns</p>
                </div>
                <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + New Checkout
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
                <div className="card">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Active Checkouts</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {checkouts.filter(c => c.status === 'OUT').length}
                    </p>
                </div>
                <div className="card">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Overdue Items</h3>
                    <p className="text-3xl font-bold text-red-600">
                        {checkouts.filter(c => c.status === 'OUT' && isOverdue(c.expected_return_date, c.status)).length}
                    </p>
                </div>
                <div className="card">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Due This Week</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        {checkouts.filter(c => {
                            if (c.status === 'RETURNED') return false
                            const days = getDaysUntilDue(c.expected_return_date)
                            return days >= 0 && days <= 7
                        }).length}
                    </p>
                </div>
                <div className="card">
                    <h3 className="text-gray-500 text-sm font-medium mb-2">Total Returns</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {checkouts.filter(c => c.status === 'RETURNED').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex gap-3">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'active' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('overdue')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'overdue' 
                                ? 'bg-red-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Overdue
                    </button>
                    <button
                        onClick={() => setFilter('returned')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'returned' 
                                ? 'bg-green-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Returned
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filter === 'all' 
                                ? 'bg-gray-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        All
                    </button>
                </div>
            </div>

            {/* Checkouts Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checked Out By</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event/Trip</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checkout Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Return</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCheckouts.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No checkouts found for this filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredCheckouts.map((checkout) => (
                                    <tr key={checkout.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{checkout.item_name}</div>
                                            <div className="text-sm text-gray-500">SKU: {checkout.sku}</div>
                                            <div className="text-xs text-gray-400">Qty: {checkout.quantity_checked_out}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{checkout.checked_out_by}</div>
                                            {checkout.checked_out_by_adult && (
                                                <div className="text-xs text-gray-500">Adult: {checkout.checked_out_by_adult}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{checkout.event_trip_name || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(checkout.checkout_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {checkout.expected_return_date ? (
                                                <span className={isOverdue(checkout.expected_return_date, checkout.status) ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                                                    {new Date(checkout.expected_return_date).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">No due date</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(checkout)}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="text-gray-900">Out: {checkout.condition_out}</div>
                                            {checkout.condition_in && (
                                                <div className={
                                                    checkout.condition_in === 'Good' || checkout.condition_in === 'Excellent' ? 'text-green-600' :
                                                    checkout.condition_in === 'Good' ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }>In: {checkout.condition_in}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium">
                                            {checkout.status === 'OUT' && (
                                                <button
                                                    onClick={() => handleReturnClick(checkout)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Return Item
                                                </button>
                                            )}
                                            {checkout.status === 'RETURNED' && checkout.actual_return_date && (
                                                <div className="text-xs text-gray-500">
                                                    Returned: {new Date(checkout.actual_return_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">New Equipment Checkout</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Equipment *
                                </label>
                                <select
                                    value={newCheckout.equipment_id}
                                    onChange={(e) => setNewCheckout({...newCheckout, equipment_id: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select equipment...</option>
                                    {equipment.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.item_name} ({item.item_number})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Checked Out By *
                                </label>
                                <input
                                    type="text"
                                    value={newCheckout.checked_out_by}
                                    onChange={(e) => setNewCheckout({...newCheckout, checked_out_by: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Youth name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adult Leader (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={newCheckout.checked_out_by_adult}
                                    onChange={(e) => setNewCheckout({...newCheckout, checked_out_by_adult: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Adult name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Event/Trip Name
                                </label>
                                <input
                                    type="text"
                                    value={newCheckout.event_trip_name}
                                    onChange={(e) => setNewCheckout({...newCheckout, event_trip_name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., Winter Campout"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Expected Return Date *
                                </label>
                                <input
                                    type="date"
                                    value={newCheckout.expected_return_date}
                                    onChange={(e) => setNewCheckout({...newCheckout, expected_return_date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={newCheckout.quantity_checked_out}
                                    onChange={(e) => setNewCheckout({...newCheckout, quantity_checked_out: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Condition (Going Out)
                                </label>
                                <select
                                    value={newCheckout.condition_out}
                                    onChange={(e) => setNewCheckout({...newCheckout, condition_out: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Poor">Poor</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowCheckoutModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNewCheckout}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                disabled={!newCheckout.equipment_id || !newCheckout.checked_out_by || !newCheckout.expected_return_date}
                            >
                                Check Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && returningCheckout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Item</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Item:</p>
                                <p className="font-semibold">{returningCheckout.item_name}</p>
                                <p className="text-sm text-gray-500">SKU: {returningCheckout.sku}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Checked out by:</p>
                                <p className="font-semibold">{returningCheckout.checked_out_by}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Condition going out:</p>
                                <p className="font-semibold">{returningCheckout.condition_out}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Condition Returning *
                                </label>
                                <select
                                    value={conditionIn}
                                    onChange={(e) => setConditionIn(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="Excellent">Excellent</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair - Minor wear/damage</option>
                                    <option value="Poor">Poor - Needs repair</option>
                                    <option value="Damaged">Damaged - Unusable</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Return Notes (Optional)
                                </label>
                                <textarea
                                    value={returnNotes}
                                    onChange={(e) => setReturnNotes(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Any issues, damage, or notes about the return..."
                                />
                            </div>

                            {isOverdue(returningCheckout.expected_return_date, returningCheckout.status) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-sm text-red-800">
                                        ⚠️ This item is {Math.abs(getDaysUntilDue(returningCheckout.expected_return_date))} days overdue
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowReturnModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturn}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Confirm Return
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CheckoutHistory
