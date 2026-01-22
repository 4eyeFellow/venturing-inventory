import { useState } from 'react'
import * as XLSX from 'xlsx'

function RosterUpload({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [results, setResults] = useState(null)

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch(`${API_URL}/users/bulk-import`, {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                setResults(data)
                setShowModal(true)
                if (onUploadComplete) onUploadComplete()
            } else {
                alert('Upload failed: ' + data.error)
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload roster: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const downloadTemplate = () => {
        const template = [
            {
                Name: 'John Doe',
                Email: 'john.doe@ue.edu',
                Role: 'Member',
                Phone: '(555)123-4567'
            },
            {
                Name: 'Jane Smith',
                Email: 'jane.smith@ue.edu',
                Role: 'Leader',
                Phone: '(555)987-6543'
            }
        ]

        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Roster Template')
        XLSX.writeFile(wb, 'UE_Crew_Roster_Template.xlsx')
    }

    const downloadCredentials = () => {
        if (!results || !results.results.success) return

        const credentials = results.results.success.map(user => ({
            Name: user.name,
            Email: user.email,
            'Temporary Password': user.tempPassword,
            Role: user.role,
            Instructions: 'Please change your password after first login'
        }))

        const ws = XLSX.utils.json_to_sheet(credentials)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'User Credentials')
        XLSX.writeFile(wb, 'UE_Crew_User_Credentials.xlsx')
    }

    return (
        <>
            <div className="flex gap-3">
                <button
                    onClick={downloadTemplate}
                    className="btn-secondary"
                >
                    📥 Download Template
                </button>
                
                <label className="btn-primary cursor-pointer">
                    {uploading ? '⏳ Uploading...' : '📤 Upload Roster'}
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>

            {/* Results Modal */}
            {showModal && results && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            📊 Import Results
                        </h2>

                        {/* Summary */}
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600">
                                    {results.summary.total}
                                </div>
                                <div className="text-sm text-gray-600">Total Rows</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600">
                                    {results.summary.imported}
                                </div>
                                <div className="text-sm text-gray-600">Imported</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-3xl font-bold text-yellow-600">
                                    {results.summary.skipped}
                                </div>
                                <div className="text-sm text-gray-600">Skipped</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-3xl font-bold text-red-600">
                                    {results.summary.failed}
                                </div>
                                <div className="text-sm text-gray-600">Failed</div>
                            </div>
                        </div>

                        {/* Success List */}
                        {results.results.success.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-bold text-green-900 mb-2">
                                    ✅ Successfully Imported ({results.results.success.length})
                                </h3>
                                <div className="bg-green-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    {results.results.success.map((user, i) => (
                                        <div key={i} className="text-sm py-1">
                                            {user.name} ({user.email}) - {user.role}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skipped List */}
                        {results.results.skipped.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-bold text-yellow-900 mb-2">
                                    ⚠️ Skipped ({results.results.skipped.length})
                                </h3>
                                <div className="bg-yellow-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    {results.results.skipped.map((item, i) => (
                                        <div key={i} className="text-sm py-1">
                                            {item.row.Name || item.row.name} - {item.reason}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Failed List */}
                        {results.results.failed.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-bold text-red-900 mb-2">
                                    ❌ Failed ({results.results.failed.length})
                                </h3>
                                <div className="bg-red-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                                    {results.results.failed.map((item, i) => (
                                        <div key={i} className="text-sm py-1">
                                            {item.row.Name || item.row.name || 'Unknown'} - {item.error}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end mt-6">
                            {results.results.success.length > 0 && (
                                <button
                                    onClick={downloadCredentials}
                                    className="btn-primary"
                                >
                                    📥 Download Credentials
                                </button>
                            )}
                            <button
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>📝 Next Steps:</strong> Download the credentials file and securely share login info with new users. They should change their password on first login.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default RosterUpload
