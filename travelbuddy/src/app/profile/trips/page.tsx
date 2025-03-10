// Updated app/profile/trips/page.tsx with trips components and request links
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TripCard from '@/components/trip-card';

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
    imageUrl?: string;
    maxParticipants: number;
};

export default function UserTripsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [createdTrips, setCreatedTrips] = useState<Trip[]>([]);
    const [joinedTrips, setJoinedTrips] = useState<Trip[]>([]);
    const [activeTab, setActiveTab] = useState<'created' | 'joined'>('created');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

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

        const fetchPendingRequests = async () => {
            if (status !== 'authenticated') return;

            try {
                const response = await fetch('/api/requests/pending-count');
                if (response.ok) {
                    const data = await response.json();
                    setPendingRequestsCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching pending requests:', error);
            }
        };

        fetchTrips();
        fetchPendingRequests();
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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <h1 className="text-3xl font-bold">Your Trips</h1>
                    <div className="flex mt-4 md:mt-0 space-x-3">
                        {pendingRequestsCount > 0 && (
                            <Link
                                href="/requests"
                                className="inline-flex items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md shadow-sm text-red-500 bg-white hover:bg-red-50"
                            >
                                <span>Pending Requests</span>
                                <span className="ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                    {pendingRequestsCount}
                                </span>
                            </Link>
                        )}
                        <Link
                            href="/trips/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Trip
                        </Link>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border-l-4 border-red-500">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="border-b border-border">
                        <nav className="-mb-px flex">
                            <button
                                className={`${activeTab === 'created'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-secondary hover:text-foreground hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
                                onClick={() => setActiveTab('created')}
                            >
                                Created by you ({createdTrips.length})
                            </button>
                            <button
                                className={`${activeTab === 'joined'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-secondary hover:text-foreground hover:border-gray-300'
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
                            <div className="grid md:grid-cols-2 gap-6">
                                {createdTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips created yet</h3>
                                <p className="text-secondary mb-6">You haven't created any trips. Start planning your next adventure!</p>
                                <Link
                                    href="/trips/create"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700"
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
                            <div className="grid md:grid-cols-2 gap-6">
                                {joinedTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips joined yet</h3>
                                <p className="text-secondary mb-6">You haven't joined any trips. Explore available trips and connect with other travelers!</p>
                                <Link
                                    href="/trips"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700"
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