// app/trips/[id]/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import "../trip-details.css";

type Trip = {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    activities: string[];
    maxParticipants: number;
    status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
    creator: {
        id: string;
        name: string;
        profileImage: string | null;
        bio: string | null;
        languages: string[];
        nationality: string | null;
    };
    participants: {
        id: string;
        name: string;
        profileImage: string | null;
    }[];
    isCreator: boolean;
    hasRequested: boolean;
    isParticipant: boolean;
    imageUrl?: string;
};

function TripDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status: authStatus } = useSession();
    const tripId = params.id as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [showJoinForm, setShowJoinForm] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');
    const [joinRequestSent, setJoinRequestSent] = useState(false);
    // In your Trip Detail component, add state for pending requests count
    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);


    const renderTripCreatorOptions = (
        tripId: string,
        pendingRequestsCount: number,
        handleDeleteTrip: () => Promise<void>
    ) => {
        return (
            <div>
                <h3 className="text-lg font-semibold mb-4">Manage Your Trip</h3>
                <div className="flex flex-col gap-3">
                    {pendingRequestsCount > 0 && (
                        <Link
                            href={`/trips/${tripId}/requests`}
                            className="inline-flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                        >
                            <span>Pending Requests</span>
                            <span className="ml-2 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                {pendingRequestsCount}
                            </span>
                        </Link>
                    )}
                    <Link
                        href={`/trips/${tripId}/edit`}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover transition text-center"
                    >
                        Edit Trip Details
                    </Link>
                    <Link
                        href={`/trips/${tripId}/requests`}
                        className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition text-center"
                    >
                        Manage Requests
                    </Link>
                    <button
                        onClick={handleDeleteTrip}
                        className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-md hover:bg-red-50 transition"
                    >
                        Delete Trip
                    </button>
                </div>
            </div>
        );
    };

    // Add this effect to fetch pending requests count
    useEffect(() => {
        const fetchPendingRequestsCount = async () => {
            if (authStatus !== 'authenticated' || !trip?.isCreator) return;

            try {
                const response = await fetch(`/api/trips/${tripId}/join/count`);
                if (response.ok) {
                    const data = await response.json();
                    setPendingRequestsCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching pending requests count:', error);
            }
        };

        if (trip?.isCreator) {
            fetchPendingRequestsCount();
        }
    }, [tripId, trip?.isCreator]); // Remove status from dependencies

    // Fetch trip data
    useEffect(() => {
        const fetchTrip = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/trips/${tripId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Trip not found');
                    }
                    throw new Error('Failed to fetch trip details');
                }

                const data = await response.json();
                setTrip(data);
            } catch (err: any) {
                console.error('Error fetching trip:', err);
                setError(err.message || 'An error occurred while fetching trip details');
            } finally {
                setLoading(false);
            }
        };

        if (tripId) {
            fetchTrip();
        }
    }, [tripId, authStatus, joinRequestSent]);

    const handleJoinRequest = () => {
        if (authStatus !== 'authenticated') {
            router.push(`/auth/login?redirect=/trips/${tripId}`);
            return;
        }

        setShowJoinForm(true);
    };

    const sendJoinRequest = async () => {
        if (!joinMessage.trim()) {
            return;
        }

        try {
            setSending(true);
            const response = await fetch(`/api/trips/${tripId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: joinMessage,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send join request');
            }

            // Success!
            setJoinRequestSent(true);
            setShowJoinForm(false);
        } catch (err: any) {
            console.error('Error sending join request:', err);
            setError(err.message || 'An error occurred while sending your request');
        } finally {
            setSending(false);
        }
    };

    const handleDeleteTrip = async () => {
        if (!window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/trips/${tripId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete trip');
            }

            router.push('/trips');
        } catch (err: any) {
            console.error('Error deleting trip:', err);
            setError(err.message || 'An error occurred while deleting the trip');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-foreground mb-6">{error}</p>
                    <Link href="/trips" className="text-blue-600 hover:underline">
                        Browse all trips
                    </Link>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">Trip not found</h2>
                    <p className="text-foreground mb-6">The trip you're looking for doesn't exist or has been removed.</p>
                    <Link href="/trips" className="text-blue-600 hover:underline">
                        Browse all trips
                    </Link>
                </div>
            </div>
        );
    }

    const isFull = trip.participants.length >= trip.maxParticipants || trip.status === 'FULL';
    const canJoin = !trip.isCreator && !trip.isParticipant && !trip.hasRequested && trip.status === 'OPEN';
    const isUpcoming = new Date(trip.startDate) > new Date();

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/trips" className="flex items-center text-blue-600 mb-6 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to all trips
            </Link>

            {/* Status Banner */}
            {trip.status !== 'OPEN' && (
                <div className={`mb-6 p-4 rounded-md trip-status-banner ${trip.status === 'FULL' ? 'full' :
                    trip.status === 'COMPLETED' ? 'completed' :
                        'cancelled'
                    }`}>
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {trip.status === 'FULL' && (
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            )}
                            {trip.status === 'COMPLETED' && (
                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            {trip.status === 'CANCELLED' && (
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">
                                {trip.status === 'FULL' && 'This trip is currently full'}
                                {trip.status === 'COMPLETED' && 'This trip has been completed'}
                                {trip.status === 'CANCELLED' && 'This trip has been cancelled'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                {/* Trip Header */}
                <div className="relative h-64 md:h-80">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    {trip.imageUrl ? (
                        <div className="absolute inset-0">
                            <Image
                                src={trip.imageUrl}
                                alt={trip.title}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/default-trip.jpg';
                                }}
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-primary"></div>
                    )}
                    <div className="absolute bottom-0 left-0 p-6 text-white z-20">
                        <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
                        <div className="flex items-center mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {trip.destination}
                        </div>
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Trip Content */}
                <div className="p-6">
                    <div className="flex flex-col md:flex-row md:gap-8">
                        {/* Trip Details */}
                        <div className="md:w-2/3">
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">About This Trip</h2>
                                <p className="text-foreground whitespace-pre-line">{trip.description}</p>
                            </div>

                            {trip.activities.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-2xl font-semibold mb-4">Activities</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {trip.activities.map((activity, index) => (
                                            <span key={index} className="activity-tag">
                                                {activity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Travel Buddies</h2>
                                <p className="text-gray-600 mb-4">
                                    {trip.participants.length} out of {trip.maxParticipants} travelers joined
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    {trip.participants.map((participant) => (
                                        <div key={participant.id} className="flex flex-col items-center">
                                            <div className="relative w-16 h-16 mb-2">
                                                {participant.profileImage ? (
                                                    <Image
                                                        src={participant.profileImage}
                                                        alt={participant.name}
                                                        fill
                                                        className="rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
                                                        {participant.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm">{participant.name}</span>
                                            {participant.id === trip.creator.id && (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mt-1">
                                                    Host
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {Array.from({ length: Math.max(0, trip.maxParticipants - trip.participants.length) }).map((_, index) => (
                                        <div key={`empty-${index}`} className="flex flex-col items-center">
                                            <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-secondary">Available</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="md:w-1/3">
                            {/* Trip Creator */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold mb-4">Trip Host</h3>
                                <div className="flex items-center mb-4">
                                    <div className="mr-3">
                                        {trip.creator.profileImage ? (
                                            <div className="relative w-16 h-16">
                                                <Image
                                                    src={trip.creator.profileImage}
                                                    alt={trip.creator.name}
                                                    fill
                                                    className="rounded-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
                                                {trip.creator.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{trip.creator.name}</h4>
                                        <div className="flex mt-1">
                                            <Link href={`/profile/${trip.creator.id}`} className="text-blue-600 text-sm hover:underline">
                                                View Profile
                                            </Link>
                                            {!trip.isCreator && (
                                                <>
                                                    <span className="mx-2 text-gray-300">|</span>
                                                    <Link href={`/messages/${trip.creator.id}`} className="text-blue-600 text-sm hover:underline">
                                                        Send Message
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {trip.creator.bio && (
                                    <div className="mb-4">
                                        <h4 className="font-medium mb-2">Bio</h4>
                                        <p className="text-sm text-foreground">{trip.creator.bio}</p>
                                    </div>
                                )}

                                {trip.creator.languages && trip.creator.languages.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Languages</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {trip.creator.languages.map((language, index) => (
                                                <span key={index} className="bg-gray-200 dark:bg-blue-800 text-gray-800 dark:text-blue-100 px-3 py-1 rounded-full text-sm">
                                                    {language}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Join Trip / Trip Actions */}
                            <div className="bg-white border border-border rounded-lg p-6">
                                {/* Trip Creator Options */}
                                {trip.isCreator ? (
                                    renderTripCreatorOptions(tripId, pendingRequestsCount, handleDeleteTrip)
                                ) :
                                    /* User who has already joined */
                                    trip.isParticipant ? (
                                        <div className="text-center">
                                            <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <h3 className="font-semibold mb-1">You've joined this trip!</h3>
                                                <p className="text-sm">You can message the host or other participants for details.</p>
                                            </div>
                                            <Link
                                                href={`/messages/${trip.creator.id}`}
                                                className="block w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-center"
                                            >
                                                Message Host
                                            </Link>
                                        </div>
                                    ) :
                                        /* User who has requested to join */
                                        trip.hasRequested ? (
                                            <div className="text-center">
                                                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <h3 className="font-semibold mb-1">Request Pending</h3>
                                                    <p className="text-sm">The trip host will respond to your request soon.</p>
                                                </div>
                                                <Link
                                                    href={`/messages/${trip.creator.id}`}
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    Send a message to the host
                                                </Link>
                                            </div>
                                        ) :
                                            /* Show join form */
                                            showJoinForm ? (
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-4">Send a Message to Join</h3>
                                                    <p className="text-sm text-gray-600 mb-4">
                                                        Introduce yourself and explain why you'd like to join this trip.
                                                    </p>
                                                    <textarea
                                                        value={joinMessage}
                                                        onChange={(e) => setJoinMessage(e.target.value)}
                                                        rows={5}
                                                        className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder={`Hi ${trip.creator.name}! I'm interested in joining your trip to ${trip.destination}...`}
                                                    ></textarea>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={sendJoinRequest}
                                                            disabled={sending || !joinMessage.trim()}
                                                            className={`flex-1 px-4 py-2 rounded-md transition ${sending || !joinMessage.trim()
                                                                ? "bg-gray-300 dark:bg-gray-700 text-secondary dark:text-gray-300 cursor-not-allowed"
                                                                : "bg-primary text-white hover:bg-blue-700 dark:hover:bg-blue-600"
                                                                }`}
                                                        >
                                                            {sending ? "Sending..." : "Send Request"}
                                                        </button>
                                                        <button
                                                            onClick={() => setShowJoinForm(false)}
                                                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) :
                                                /* Default join options */
                                                (
                                                    <div>
                                                        <h3 className="text-lg font-semibold mb-2">Interested in this trip?</h3>
                                                        <p className="text-sm text-gray-600 mb-4">
                                                            {!isUpcoming
                                                                ? "This trip has already started."
                                                                : trip.status !== 'OPEN'
                                                                    ? `This trip is ${trip.status.toLowerCase()}.`
                                                                    : isFull
                                                                        ? "This trip is currently full, but you can still send a request in case a spot opens up."
                                                                        : "Send a request to join and connect with the trip host."}
                                                        </p>
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="text-gray-600">Spots available:</span>
                                                            <span className="font-medium">
                                                                {trip.participants.length} / {trip.maxParticipants}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={handleJoinRequest}
                                                            disabled={!isUpcoming || trip.status === 'CANCELLED'}
                                                            className={`w-full px-4 py-2 rounded-md transition ${!isUpcoming || trip.status === 'CANCELLED'
                                                                ? "bg-gray-300 text-secondary cursor-not-allowed"
                                                                : isFull
                                                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                                                    : "bg-primary hover:bg-primary-hover text-white"
                                                                }`}
                                                        >
                                                            {!isUpcoming
                                                                ? "Trip Already Started"
                                                                : trip.status === 'CANCELLED'
                                                                    ? "Trip Cancelled"
                                                                    : isFull
                                                                        ? "Join Waitlist"
                                                                        : "Request to Join"}
                                                        </button>
                                                    </div>
                                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default function TripDetailPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        }>
            <TripDetailContent />
        </Suspense>
    );
}