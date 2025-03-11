// components/trip-card.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type TripCardProps = {
    trip: {
        id: string;
        title: string;
        destination: string;
        startDate: string;
        endDate: string;
        description: string;
        maxParticipants: number;
        participantCount: number,
        participants: {
            id: string;
            name: string;
            profileImage: string | null;
        }[];
        isCreator: boolean;
        status: string;
        creator: {
            id: string;
            name: string;
            profileImage: string | null;
        };
        imageUrl?: string;
    };
};

export const TripCard = ({ trip }: TripCardProps) => {
    const [pendingRequests, setPendingRequests] = useState(0);

    // Fetch pending requests count for this trip
    useEffect(() => {
        if (trip.isCreator) {
            const fetchPendingRequestsCount = async () => {
                try {
                    const response = await fetch(`/api/trips/${trip.id}/join/count`);
                    if (response.ok) {
                        const data = await response.json();
                        setPendingRequests(data.count);
                    }
                } catch (error) {
                    console.error('Error fetching pending requests count:', error);
                }
            };

            fetchPendingRequestsCount();
        }
    }, [trip.id, trip.isCreator]);

    // Format date range for display
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

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'FULL':
                return 'bg-yellow-100 text-yellow-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    // Get the correct image source
    const getTripImageSrc = () => {
        if (trip.imageUrl) {
            return trip.imageUrl;
        }
        return '/images/default-trip.jpg';
    };

    return (
        <div className="bg-card border border-border shadow rounded-lg overflow-hidden">
            <div className="relative h-48">
                <Image
                    src={getTripImageSrc()}
                    alt={trip.destination}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-trip.jpg';
                    }}
                />
                {trip.status !== 'OPEN' && (
                    <div className={`absolute top-2 right-2 ${getStatusBadge(trip.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                        {trip.status.charAt(0) + trip.status.slice(1).toLowerCase()}
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">{trip.title}</h2>
                    <span className="status-badge open">
                        {trip.participantCount}/{trip.maxParticipants || 0} joined
                    </span>
                </div>

                <div className="mb-4">
                    <div className="flex items-center text-gray-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {trip.destination}
                    </div>

                    <div className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateRange(trip.startDate, trip.endDate)}
                    </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3">{trip.description}</p>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="relative w-10 h-10 mr-3">
                            {trip.creator.profileImage ? (
                                <Image
                                    src={trip.creator.profileImage}
                                    alt={trip.creator.name}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                                    {trip.creator.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="text-sm text-foreground">{trip.creator.name}</span>
                    </div>

                    <div className="flex gap-2">
                        {trip.isCreator && pendingRequests > 0 && (
                            <Link
                                href={`/trips/${trip.id}/requests`}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition flex items-center"
                            >
                                <span>Requests</span>
                                <span className="ml-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                    {pendingRequests}
                                </span>
                            </Link>
                        )}
                        <Link
                            href={`/trips/${trip.id}`}
                            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            View
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TripCard;