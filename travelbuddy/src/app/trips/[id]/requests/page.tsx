// app/trips/[id]/requests/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type JoinRequest = {
    id: string;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    sender: {
        id: string;
        name: string;
        profileImage: string | null;
        nationality: string | null;
        languages: string[];
    };
};

type Trip = {
    id: string;
    title: string;
    destination: string;
    maxParticipants: number;
    participants: {
        id: string;
        name: string;
        profileImage: string | null;
    }[];
};

export default function TripRequestsPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();
    const params = useParams();
    const tripId = params.id as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            router.push('/auth/login?redirect=/trips/' + tripId + '/requests');
        }
    }, [authStatus, router, tripId]);

    // Fetch trip and join requests
    useEffect(() => {
        const fetchData = async () => {
            if (authStatus !== 'authenticated') return;

            try {
                setLoading(true);

                // Fetch trip details
                const tripResponse = await fetch(`/api/trips/${tripId}`);

                if (!tripResponse.ok) {
                    if (tripResponse.status === 404) {
                        throw new Error('Trip not found');
                    }
                    throw new Error('Failed to fetch trip details');
                }

                const tripData = await tripResponse.json();

                // Check if user is the creator
                if (!tripData.isCreator) {
                    router.push(`/trips/${tripId}`);
                    return;
                }

                setTrip(tripData);

                // Fetch join requests from the /api/requests endpoint which we know is working
                // Filter requests for this specific trip
                const requestsResponse = await fetch(`/api/requests?tripId=${tripId}`);

                if (!requestsResponse.ok) {
                    throw new Error('Failed to fetch join requests');
                }

                const requestsData = await requestsResponse.json();

                // Define the request type to match your API response structure
                interface ApiJoinRequest {
                    id: string;
                    message: string;
                    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
                    createdAt: string;
                    sender: {
                        id: string;
                        name: string;
                        profileImage: string | null;
                        nationality: string | null;
                        languages: string[];
                    };
                    trip: {
                        id: string;
                        title: string;
                        destination: string;
                        startDate: string;
                        endDate: string;
                    };
                }

                // Filter to only get requests for this trip
                // This assumes the /api/requests endpoint returns data with a structure that includes pendingRequests
                const pendingRequestsForTrip = (requestsData.pendingRequests || [])
                    .filter((req: ApiJoinRequest) => req.trip && req.trip.id === tripId);

                setRequests(pendingRequestsForTrip);

            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'An error occurred while fetching data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tripId, authStatus, router]);

    const handleRequest = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            setProcessingId(requestId);
            const response = await fetch(`/api/join-requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${status.toLowerCase()} request`);
            }

            // Update the requests list
            setRequests(prev =>
                prev.map(req =>
                    req.id === requestId
                        ? { ...req, status }
                        : req
                )
            );

            // If a request was accepted, also update the trip participant count
            if (status === 'ACCEPTED') {
                if (trip) {
                    const senderInfo = requests.find(r => r.id === requestId)?.sender;
                    if (senderInfo) {
                        setTrip({
                            ...trip,
                            participants: [
                                ...trip.participants,
                                {
                                    id: senderInfo.id,
                                    name: senderInfo.name,
                                    profileImage: senderInfo.profileImage
                                }
                            ]
                        });
                    }
                }
            }

        } catch (err: any) {
            console.error(`Error ${status.toLowerCase()} request:`, err);
            setError(err.message || `An error occurred while ${status.toLowerCase()}ing the request`);
        } finally {
            setProcessingId(null);
        }
    };

    if (authStatus === 'loading' || loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (authStatus === 'unauthenticated') {
        return null; // Will redirect to login
    }

    if (!trip) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Trip not found</h2>
                    <p className="text-foreground mb-6">The trip you're looking for doesn't exist or you don't have permission to manage it.</p>
                    <Link href="/trips" className="text-blue-600 hover:underline">
                        Browse all trips
                    </Link>
                </div>
            </div>
        );
    }

    const pendingRequests = requests.filter(req => req.status === 'PENDING');
    const processedRequests = requests.filter(req => req.status !== 'PENDING');
    const isFull = trip.participants.length >= trip.maxParticipants;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <Link href={`/trips/${tripId}`} className="flex items-center text-blue-600 mb-2 hover:underline">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to trip
                        </Link>
                        <h1 className="text-3xl font-bold">Manage Join Requests</h1>
                        <p className="text-gray-600 mt-1">
                            Trip: {trip.title} - {trip.destination}
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 bg-gray-100 px-4 py-2 rounded-md">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Participants:</span> {trip.participants.length} / {trip.maxParticipants}
                        </p>
                        {isFull && (
                            <p className="text-sm text-orange-600 font-medium mt-1">
                                Trip is full
                            </p>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border-l-4 border-red-500">
                        {error}
                    </div>
                )}

                {/* Pending Requests */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="px-4 py-5 sm:px-6 border-b border-border">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Pending Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
                        </h2>
                    </div>

                    {pendingRequests.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {pendingRequests.map(request => (
                                <li key={request.id} className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start">
                                        <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
                                            {request.sender.profileImage ? (
                                                <div className="relative w-20 h-20 mb-2">
                                                    <Image
                                                        src={request.sender.profileImage}
                                                        alt={request.sender.name}
                                                        fill
                                                        className="rounded-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold mb-2">
                                                    {request.sender.name.charAt(0)}
                                                </div>
                                            )}
                                            <h3 className="font-medium text-gray-900">{request.sender.name}</h3>

                                            <div className="mt-2 flex flex-col items-center text-sm text-secondary">
                                                {request.sender.nationality && (
                                                    <p>From: {request.sender.nationality}</p>
                                                )}
                                                <Link href={`/profile/${request.sender.id}`} className="text-blue-600 hover:underline mt-1">
                                                    View Profile
                                                </Link>
                                                <Link href={`/messages/${request.sender.id}`} className="text-blue-600 hover:underline mt-1">
                                                    Send Message
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="md:w-3/4 md:pl-6">
                                            <div className="bg-gray-50 p-4 rounded-md mb-4">
                                                <p className="text-foreground whitespace-pre-line">{request.message}</p>
                                                <p className="text-xs text-secondary mt-2">
                                                    Sent: {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                                                </p>
                                            </div>

                                            <div className="flex justify-end space-x-3">
                                                <button
                                                    onClick={() => handleRequest(request.id, 'REJECTED')}
                                                    disabled={!!processingId}
                                                    className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${processingId ? 'text-gray-400 cursor-not-allowed' : 'text-foreground hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {processingId === request.id ? 'Processing...' : 'Decline'}
                                                </button>
                                                <button
                                                    onClick={() => handleRequest(request.id, 'ACCEPTED')}
                                                    disabled={!!processingId || isFull}
                                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${processingId || isFull
                                                        ? 'bg-blue-400 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {processingId === request.id
                                                        ? 'Processing...'
                                                        : isFull
                                                            ? 'Trip Full'
                                                            : 'Accept'
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-secondary">No pending requests at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Processed Requests */}
                {processedRequests.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 border-b border-border">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Previously Processed Requests
                            </h2>
                        </div>

                        <ul className="divide-y divide-gray-200">
                            {processedRequests.map(request => (
                                <li key={request.id} className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start">
                                        <div className="md:w-1/4 flex flex-col items-center mb-4 md:mb-0">
                                            {request.sender.profileImage ? (
                                                <div className="relative w-16 h-16 mb-2">
                                                    <Image
                                                        src={request.sender.profileImage}
                                                        alt={request.sender.name}
                                                        fill
                                                        className="rounded-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold mb-2">
                                                    {request.sender.name.charAt(0)}
                                                </div>
                                            )}
                                            <h3 className="font-medium text-gray-900">{request.sender.name}</h3>

                                            <div className="mt-1">
                                                <span className={`status-badge ${request.status === 'ACCEPTED' ? 'completed' : 'cancelled'
                                                    }`}>
                                                    {request.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="md:w-3/4 md:pl-6">
                                            <div className="bg-gray-50 p-4 rounded-md">
                                                <p className="text-foreground">{request.message}</p>
                                                <div className="flex justify-between mt-2 text-xs text-secondary">
                                                    <span>Sent: {new Date(request.createdAt).toLocaleDateString()}</span>
                                                    {request.status === 'ACCEPTED' && (
                                                        <Link href={`/messages/${request.sender.id}`} className="text-blue-600 hover:underline">
                                                            Send Message
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}