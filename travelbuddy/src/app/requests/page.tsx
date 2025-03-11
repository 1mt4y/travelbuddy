// app/requests/page.tsx - Renamed to page.tsx to serve as the main requests page
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
    };
    trip: {
        id: string;
        title: string;
        destination: string;
        startDate: string;
        endDate: string;
    };
};

type CreatedTrip = {
    id: string;
    title: string;
    destination: string;
    pendingRequestsCount: number;
};

function RequestsContent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
    const [previousRequests, setPreviousRequests] = useState<JoinRequest[]>([]);
    const [createdTrips, setCreatedTrips] = useState<CreatedTrip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/requests');
        }
    }, [status, router]);

    // Fetch all pending requests for trips created by the user
    useEffect(() => {
        const fetchRequests = async () => {
            if (status !== 'authenticated') return;

            try {
                setLoading(true);
                const response = await fetch('/api/requests');

                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }

                const data = await response.json();
                setPendingRequests(data.pendingRequests || []);
                setPreviousRequests(data.previousRequests || []);
                setCreatedTrips(data.createdTrips || []);
            } catch (err: any) {
                console.error('Error fetching requests:', err);
                setError(err.message || 'An error occurred while fetching requests');
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [status]);

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

            // Handle non-OK responses before trying to parse JSON
            if (!response.ok) {
                // Try to read response text first
                const errorText = await response.text();
                let errorMessage;

                try {
                    // Try to parse it as JSON
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || `Failed to ${status.toLowerCase()} request`;
                } catch (parseError) {
                    // If JSON parsing fails, use the text directly
                    errorMessage = errorText || `Failed to ${status.toLowerCase()} request`;
                }

                throw new Error(errorMessage);
            }

            // Parse successful response
            const data = await response.json();

            // Update the requests lists
            const updatedRequest = pendingRequests.find(req => req.id === requestId);
            if (updatedRequest) {
                // Remove from pending
                setPendingRequests(prev => prev.filter(req => req.id !== requestId));

                // Add to previous with updated status
                setPreviousRequests(prev => [
                    { ...updatedRequest, status },
                    ...prev
                ]);

                // Update counts in created trips
                setCreatedTrips(prev =>
                    prev.map(trip =>
                        trip.id === updatedRequest.trip.id
                            ? { ...trip, pendingRequestsCount: trip.pendingRequestsCount - 1 }
                            : trip
                    )
                );
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error
                ? err.message
                : `An error occurred while ${status.toLowerCase()}ing the request`;

            console.error(`Error ${status.toLowerCase()} request:`, errorMessage);
            setError(errorMessage);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (status === 'loading' || loading) {
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
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Trip Join Requests</h1>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md border-l-4 border-red-500">
                        {error}
                    </div>
                )}

                {createdTrips.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center mb-8">
                        <h3 className="text-xl font-semibold mb-4">No Trips Created</h3>
                        <p className="text-gray-600 mb-6">You haven't created any trips yet. Create a trip to start receiving join requests.</p>
                        <Link
                            href="/trips/create"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700"
                        >
                            Create a Trip
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Your Trips</h2>
                            <p className="text-gray-600 mt-1">View and manage requests for your trips</p>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-4">
                                {createdTrips.map(trip => (
                                    <div key={trip.id} className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
                                        <div>
                                            <Link href={`/trips/${trip.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                                                {trip.title}
                                            </Link>
                                            <p className="text-gray-600">{trip.destination}</p>
                                        </div>
                                        <div className="flex space-x-4">
                                            {trip.pendingRequestsCount > 0 ? (
                                                <Link
                                                    href={`/trips/${trip.id}/requests`}
                                                    className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                                                >
                                                    <span>Pending Requests</span>
                                                    <span className="ml-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                        {trip.pendingRequestsCount}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/trips/${trip.id}/requests`}
                                                    className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                                                >
                                                    View Requests
                                                </Link>
                                            )}
                                            <Link
                                                href={`/trips/${trip.id}/edit`}
                                                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition"
                                            >
                                                Edit Trip
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Requests Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="px-6 py-5 border-b border-border">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Pending Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
                        </h2>
                    </div>

                    {pendingRequests.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {pendingRequests.map(request => (
                                <div key={request.id} className="p-6">
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
                                                <div className="flex justify-between items-start mb-2">
                                                    <Link href={`/trips/${request.trip.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                                                        {request.trip.title}
                                                    </Link>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(request.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-2">{request.trip.destination} • {formatDate(request.trip.startDate)} to {formatDate(request.trip.endDate)}</p>
                                                <p className="text-foreground whitespace-pre-line">{request.message}</p>
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
                                                    disabled={!!processingId}
                                                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${processingId
                                                        ? 'bg-blue-400 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-blue-700'
                                                        }`}
                                                >
                                                    {processingId === request.id ? 'Processing...' : 'Accept'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-secondary">No pending requests at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Previous Requests */}
                {previousRequests.length > 0 && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="px-6 py-5 border-b border-border">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Previously Processed Requests
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {previousRequests.map(request => (
                                <div key={request.id} className="p-6">
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
                                                <div className="flex justify-between items-start mb-2">
                                                    <Link href={`/trips/${request.trip.id}`} className="text-lg font-medium text-blue-600 hover:underline">
                                                        {request.trip.title}
                                                    </Link>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(request.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-2">{request.trip.destination}</p>
                                                <p className="text-foreground">{request.message}</p>
                                                <div className="flex justify-between mt-2 text-xs text-secondary">
                                                    <span>Processed on: {formatDate(request.createdAt)}</span>
                                                    {request.status === 'ACCEPTED' && (
                                                        <Link href={`/messages/${request.sender.id}`} className="text-blue-600 hover:underline">
                                                            Send Message
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Main component with Suspense
export default function RequestsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        }>
            <RequestsContent />
        </Suspense>
    );
}