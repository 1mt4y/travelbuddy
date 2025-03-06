// app/profile/trips/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Trip = {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
    participants: {
        id: string;
        name: string;
        profileImage: string | null;
    }[];
    creator?: {
        id: string;
        name: string;
        profileImage: string | null;
    };
    isCreator: boolean;
};

export default function UserTripsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [createdTrips, setCreatedTrips] = useState<Trip[]>([]);
    const [joinedTrips, setJoinedTrips] = useState<Trip[]>([]);
    const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/profile/trips');
        }
    }, [status, router]);

    // Fetch user trips
    useEffect(() => {
        const fetchTrips = async () => {
            if (status !== 'authenticated') return;

            try {
                setLoading(true);

                const response = await fetch('/api/users/trips');

                if (!response.ok) {
                    throw new Error('Failed to fetch trips');
                }

                const data = await response.json();
                setCreatedTrips(data.createdTrips || []);
                setJoinedTrips(data.joinedTrips || []);
            } catch (err: any) {
                console.error('Error fetching trips:', err);
                setError(err.message || 'An error occurred while fetching your trips');
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [status]);

    if (status === 'loading' || (status === 'authenticated' && loading)) {
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

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // If same year
        if (start.getFullYear() === end.getFullYear()) {
            // If same month
            if (start.getMonth() === end.getMonth()) {
                return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.getDate()}, ${end.getFullYear()}`;
            }
            // Different months, same year
            return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
        }
        // Different years
        return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    const getStatusBadge = (status: Trip['status'], startDate: string, endDate: string) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        let badgeColor = '';
        let badgeText = '';

        if (status === 'CANCELLED') {
            badgeColor = 'bg-red-100 text-red-800';
            badgeText = 'Cancelled';
        } else if (status === 'COMPLETED') {
            badgeColor = 'bg-green-100 text-green-800';
            badgeText = 'Completed';
        } else if (now > end) {
            badgeColor = 'bg-gray-100 text-gray-800';
            badgeText = 'Past';
        } else if (now >= start && now <= end) {
            badgeColor = 'bg-blue-100 text-blue-800';
            badgeText = 'Ongoing';
        } else if (status === 'FULL') {
            badgeColor = 'bg-yellow-100 text-yellow-800';
            badgeText = 'Full';
        } else {
            badgeColor = 'bg-green-100 text-green-800';
            badgeText = 'Upcoming';
        }

        return (
            <span className={`${badgeColor} px-2 py-1 text-xs font-medium rounded-full`}>
                {badgeText}
            </span>
        );
    };

    const renderTripCard = (trip: Trip) => (
        <div key={trip.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 flex-1 mr-2">{trip.title}</h3>
                    {getStatusBadge(trip.status, trip.startDate, trip.endDate)}
                </div>

                <div className="flex items-center text-gray-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{trip.destination}</span>
                </div>

                <div className="flex items-center text-gray-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                </div>

                {!trip.isCreator && trip.creator && (
                    <div className="flex items-center mb-4">
                        <div className="mr-2">
                            {trip.creator.profileImage ? (
                                <div className="relative w-8 h-8">
                                    <Image
                                        src={trip.creator.profileImage}
                                        alt={trip.creator.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {trip.creator.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-500">Host: </span>
                            <span className="text-gray-700">{trip.creator.name}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                        <div className="text-sm text-gray-500">
                            {trip.participants.length} / {trip.participants.length} travelers
                        </div>
                    </div>

                    <Link
                        href={`/trips/${trip.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Your Trips</h1>
                    <Link
                        href="/trips/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Trip
                    </Link>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border-l-4 border-red-500">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                className={`${activeTab === 'created'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                                onClick={() => setActiveTab('created')}
                            >
                                Created by you ({createdTrips.length})
                            </button>
                            <button
                                className={`${activeTab === 'joined'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                                onClick={() => setActiveTab('joined')}
                            >
                                Joined by you ({joinedTrips.length})
                            </button>
                        </nav>
                    </div>
                </div>

                {activeTab === 'created' && (
                    <>
                        {createdTrips.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {createdTrips.map(trip => renderTripCard(trip))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips created yet</h3>
                                <p className="text-gray-500 mb-6">You haven't created any trips. Start planning your next adventure!</p>
                                <Link
                                    href="/trips/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Create Your First Trip
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'joined' && (
                    <>
                        {joinedTrips.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {joinedTrips.map(trip => renderTripCard(trip))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips joined yet</h3>
                                <p className="text-gray-500 mb-6">You haven't joined any trips. Explore available trips and connect with other travelers!</p>
                                <Link
                                    href="/trips"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Find Trips to Join
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}