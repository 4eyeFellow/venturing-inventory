import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TripList from './pages/TripList'
import TripDetails from './pages/TripDetails'
import CreateTrip from './pages/CreateTrip'
import EditTrip from './pages/EditTrip'
import Profile from './pages/Profile'
import UserManagement from './pages/UserManagement'
import LessonsLearned from './pages/LessonsLearned'
import VendorDirectory from './pages/VendorDirectory'
import EquipmentAvailability from './pages/EquipmentAvailability'
import CheckoutHistory from './pages/CheckoutHistory'

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes - All require authentication */}
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/trips" element={
                    <ProtectedRoute>
                        <Layout><TripList /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/lessons" element={
                    <ProtectedRoute>
                        <Layout><LessonsLearned /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/vendors" element={
                    <ProtectedRoute>
                        <Layout><VendorDirectory /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/equipment" element={
                    <ProtectedRoute>
                        <Layout><EquipmentAvailability /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/checkout-history" element={
                    <ProtectedRoute>
                        <Layout><CheckoutHistory /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/trips/create" element={
                    <ProtectedRoute requiredRole={['Admin', 'Leader']}>
                        <Layout><CreateTrip /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/trips/:id/edit" element={
                    <ProtectedRoute requiredRole={['Admin', 'Leader']}>
                        <Layout><EditTrip /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/trips/:id" element={
                    <ProtectedRoute>
                        <Layout><TripDetails /></Layout>
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Layout><Profile /></Layout>
                    </ProtectedRoute>
                } />

                {/* Admin Only Route */}
                <Route path="/users" element={
                    <ProtectedRoute requiredRole="Admin">
                        <Layout><UserManagement /></Layout>
                    </ProtectedRoute>
                } />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    )
}

export default App
