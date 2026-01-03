import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { claims } from '../services/api';
import Disclaimer from '../components/Disclaimer';
import { CLAIM_TEMPLATES, getTemplateById } from '../data/claimTemplates';

const CATEGORIES = ['Residence', 'Employment', 'Dependency', 'Education', 'Other'];

export default function CreateClaimPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        startDate: '',
        endDate: '',
        location: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTemplateSelect = (templateId) => {
        const template = getTemplateById(templateId);
        if (template) {
            setSelectedTemplate(templateId);
            setFormData(prev => ({
                ...prev,
                category: template.category,
                title: template.titleTemplate,
                description: template.descriptionTemplate
            }));
        }
    };

    const captureLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Try to get address from coordinates (reverse geocoding)
                let address = null;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        {
                            headers: {
                                'User-Agent': 'Attest/1.0'
                            }
                        }
                    );
                    const data = await response.json();
                    address = data.display_name;
                } catch (e) {
                    console.log('Could not get address:', e);
                    // Continue without address - still have coordinates
                }

                setFormData(prev => ({
                    ...prev,
                    location: {
                        lat: latitude,
                        lng: longitude,
                        address: address,
                        capturedAt: new Date().toISOString()
                    }
                }));
                setLocationLoading(false);
            },
            (error) => {
                setLocationLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setError('Location permission denied. Please allow location access in your browser settings.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setError('Location information is unavailable. Please try again.');
                        break;
                    case error.TIMEOUT:
                        setError('Location request timed out. Please try again.');
                        break;
                    default:
                        setError('Could not get your location. Please try again.');
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    const clearLocation = () => {
        setFormData(prev => ({ ...prev, location: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.title.length < 5) {
            setError('Title must be at least 5 characters');
            return;
        }
        if (formData.description.length < 20) {
            setError('Description must be at least 20 characters');
            return;
        }
        if (!formData.category) {
            setError('Please select a category');
            return;
        }
        if (!formData.startDate) {
            setError('Start date is required');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await claims.create(formData);
            navigate(`/claims/${response.data.claim.id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create claim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="document-container">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Create New Claim</h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                    Document a real-life claim to be verified by witnesses
                </p>
            </div>

            <Disclaimer className="mb-8" />

            {/* Templates */}
            <div className="document-card mb-6">
                <h2 className="font-semibold mb-4">Start with a Template</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                    Choose a template to auto-fill the form, or start from scratch below.
                </p>

                {/* Group templates by category */}
                {['Residence', 'Employment', 'Education', 'Dependency', 'Other'].map(category => {
                    const categoryTemplates = CLAIM_TEMPLATES.filter(t => t.category === category && t.id !== 'custom');
                    if (categoryTemplates.length === 0) return null;

                    return (
                        <div key={category} className="mb-4 last:mb-0">
                            <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">{category}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {categoryTemplates.map(template => (
                                    <button
                                        key={template.id}
                                        type="button"
                                        className={`
                                            p-2 rounded-lg border text-left text-xs transition-all
                                            ${selectedTemplate === template.id
                                                ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30'
                                                : 'border-[var(--color-border)] hover:border-accent-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                                            }
                                        `}
                                        onClick={() => handleTemplateSelect(template.id)}
                                    >
                                        <span className="font-medium block truncate">{template.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handleSubmit} className="document-card-lg">
                {error && (
                    <div className="mb-6 p-3 bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-300 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <label className="form-label">Title *</label>
                    <input
                        type="text"
                        name="title"
                        className="form-input"
                        placeholder="e.g., Residence at 123 Main St, Mumbai"
                        value={formData.title}
                        onChange={handleChange}
                    />
                    <p className="form-helper">A clear, concise title for your claim</p>
                </div>

                <div className="mb-6">
                    <label className="form-label">Description *</label>
                    <textarea
                        name="description"
                        className="form-input min-h-[150px]"
                        placeholder="Provide a detailed description of your claim. Include relevant details that witnesses can verify..."
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <p className="form-helper">
                        Minimum 20 characters. Be specific and accurate.
                    </p>
                </div>

                <div className="mb-6">
                    <label className="form-label">Category *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                type="button"
                                className={`
                                    px-4 py-3 rounded-lg border text-sm font-medium transition-all
                                    ${formData.category === cat
                                        ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300'
                                        : 'border-[var(--color-border)] hover:border-accent-300'
                                    }
                                `}
                                onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="form-label">Start Date *</label>
                        <input
                            type="date"
                            name="startDate"
                            className="form-input"
                            value={formData.startDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="form-label">End Date (Optional)</label>
                        <input
                            type="date"
                            name="endDate"
                            className="form-input"
                            value={formData.endDate}
                            onChange={handleChange}
                        />
                        <p className="form-helper">Leave empty for ongoing claims</p>
                    </div>
                </div>

                {/* Location */}
                <div className="mb-8">
                    <label className="form-label">Location (Optional)</label>
                    {formData.location ? (
                        <div className="p-4 bg-success-50 dark:bg-success-900/30 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-success-700 dark:text-success-300">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-medium">Location Captured</span>
                                    </div>
                                    <p className="text-sm mt-2">
                                        {formData.location.address || `${formData.location.lat.toFixed(6)}, ${formData.location.lng.toFixed(6)}`}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                        Captured: {new Date(formData.location.capturedAt).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={clearLocation}
                                    className="text-sm text-danger-600 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={captureLocation}
                            disabled={locationLoading}
                            className="w-full p-4 border border-dashed border-[var(--color-border)] rounded-lg hover:border-accent-300 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition-colors"
                        >
                            {locationLoading ? (
                                <span className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                                    <span className="spinner" />
                                    Getting location...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Capture Current Location
                                </span>
                            )}
                        </button>
                    )}
                    <p className="form-helper">Add your current GPS coordinates to strengthen the claim</p>
                </div>

                <div className="bg-primary-50 dark:bg-primary-900/50 rounded-lg p-4 mb-8">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm">
                            <p className="font-medium">Claims are immutable</p>
                            <p className="text-[var(--color-text-secondary)] mt-1">
                                Once submitted, this claim cannot be edited or deleted.
                                Please review all information carefully before submitting.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="spinner" />
                                Creating...
                            </span>
                        ) : (
                            'Create Claim'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
