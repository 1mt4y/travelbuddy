// app/trips/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTripPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        startDate: '',
        endDate: '',
        description: '',
        activities: '',
        maxParticipants: 2,
    });

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/trips/create');
        }
    }, [status, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title || !formData.destination || !formData.startDate || !formData.endDate) {
            setError('Title, destination, start date, and end date are required');
            return;
        }

        // Validate dates
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
            setError('Start date cannot be in the past');
            return;
        }

        if (end <= start) {
            setError('End date must be after start date');
            return;
        }

        try {
            setError('');
            setSubmitting(true);

            // Parse activities from comma-separated string
            const activities = formData.activities
                ? formData.activities.split(',').map(activity => activity.trim())
                : [];

            const response = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    activities,
                    maxParticipants: Number(formData.maxParticipants),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create trip');
            }

            const { trip } = await response.json();

            // Navigate to the newly created trip
            router.push(`/trips/${trip.id}`);

        } catch (err: any) {
            console.error('Error creating trip:', err);
            setError(err.message || 'An error occurred while creating the trip');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null; // Will redirect to login
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Create a New Trip</h1>
                    <Link
                        href="/trips"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-foreground bg-white hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to trips
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border-l-4 border-red-500">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                                Trip Title*
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Weekend Hiking in the Mountains"
                                className="block w-full bg-card text-foreground border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="destination" className="block text-sm font-medium text-foreground mb-1">
                                Destination*
                            </label>
                            <input
                                type="text"
                                id="destination"
                                name="destination"
                                value={formData.destination}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Paris, France"
                                className="block w-full bg-card text-foreground border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-1">
                                    Start Date*
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="block w-full bg-card text-foreground border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-1">
                                    End Date*
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    required
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    className="block w-full bg-card text-foreground border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                                Trip Description*
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Describe your trip, the places you want to visit, and what you're looking for in travel companions..."
                                className="block w-full bg-card text-foreground border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="activities" className="block text-sm font-medium text-foreground mb-1">
                                Activities (comma separated)
                            </label>
                            <input
                                type="text"
                                id="activities"
                                name="activities"
                                value={formData.activities}
                                onChange={handleChange}
                                placeholder="e.g. Hiking, Museums, Food tours, Photography"
                                className="block w-full bg-card text-foreground border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                            <p className="mt-1 text-sm text-secondary">
                                List the main activities you're planning to do during this trip
                            </p>
                        </div>

                        <div>
                            <label htmlFor="maxParticipants" className="block text-sm font-medium text-foreground mb-1">
                                Maximum Number of Participants
                            </label>
                            <select
                                id="maxParticipants"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                className="block w-full bg-card text-foreground border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            >
                                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-sm text-secondary">
                                Including yourself
                            </p>
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700'
                                }`}
                        >
                            {submitting ? 'Creating...' : 'Create Trip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}