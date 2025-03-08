// app/trips/page.tsx
'use client';

// Add this to prevent prerendering errors
export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Trip = {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    maxParticipants: number;
    participants: string[];
    creatorId: string;
    creatorName: string;
    creatorImage: string;
};

function TripsContent() {
    const searchParams = useSearchParams();
    const initialDestination = searchParams.get('destination') || '';

    const [destination, setDestination] = useState(initialDestination);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data for MVP demo
    useEffect(() => {
        // In a real app, this would be an API call
        setTimeout(() => {
            const mockTrips: Trip[] = [
                {
                    id: '1',
                    title: 'Exploring Rome and Florence',
                    destination: 'Italy',
                    startDate: '2025-03-15',
                    endDate: '2025-03-22',
                    description: 'Looking for 2-3 people to join me on a cultural tour of Rome and Florence. Planning to visit museums, historical sites, and enjoy authentic Italian cuisine.',
                    maxParticipants: 4,
                    participants: ['user1'],
                    creatorId: 'user1',
                    creatorName: 'Alex Johnson',
                    creatorImage: '/images/user1.jpg',
                },
                {
                    id: '2',
                    title: 'Beach Hopping in Southern Italy',
                    destination: 'Italy',
                    startDate: '2025-04-01',
                    endDate: '2025-04-10',
                    description: 'Planning to visit the Amalfi Coast and Sicily. Looking for laid-back travel buddies who enjoy beaches, swimming, and seafood.',
                    maxParticipants: 3,
                    participants: ['user2'],
                    creatorId: 'user2',
                    creatorName: 'Sofia Martinez',
                    creatorImage: '/images/user2.jpg',
                },
                {
                    id: '3',
                    title: 'Tokyo Adventure',
                    destination: 'Japan',
                    startDate: '2025-05-05',
                    endDate: '2025-05-15',
                    description: 'Exploring Tokyo and surrounding areas. Interested in anime, gaming, and Japanese culture.',
                    maxParticipants: 3,
                    participants: ['user3'],
                    creatorId: 'user3',
                    creatorName: 'Ryan Kim',
                    creatorImage: '/images/user3.jpg',
                },
                {
                    id: '4',
                    title: 'Island Hopping in Thailand',
                    destination: 'Thailand',
                    startDate: '2025-03-20',
                    endDate: '2025-04-05',
                    description: 'Planning to visit several islands in Thailand. Looking for people who enjoy snorkeling, beach activities, and trying local food.',
                    maxParticipants: 5,
                    participants: ['user4'],
                    creatorId: 'user4',
                    creatorName: 'Emily Wong',
                    creatorImage: '/images/user4.jpg',
                },
            ];

            // Filter trips based on search parameters
            let filteredTrips = mockTrips;

            if (initialDestination) {
                filteredTrips = filteredTrips.filter(trip =>
                    trip.destination.toLowerCase().includes(initialDestination.toLowerCase())
                );
            }

            setTrips(filteredTrips);
            setLoading(false);
        }, 1000);
    }, [initialDestination]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would trigger an API call with filters
        setLoading(true);

        setTimeout(() => {
            const filteredTrips = trips.filter(trip => {
                const matchesDestination = !destination ||
                    trip.destination.toLowerCase().includes(destination.toLowerCase());

                const matchesStartDate = !startDate || new Date(trip.startDate) >= new Date(startDate);

                const matchesEndDate = !endDate || new Date(trip.endDate) <= new Date(endDate);

                return matchesDestination && matchesStartDate && matchesEndDate;
            });

            setTrips(filteredTrips);
            setLoading(false);
        }, 500);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Find Travel Companions</h1>

            {/* Search Form */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="destination" className="block text-sm font-medium text-foreground mb-1">
                            Destination
                        </label>
                        <input
                            type="text"
                            id="destination"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="Country, city, or region"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="md:w-1/4">
                        <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-1">
                            Start Date (After)
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="md:w-1/4">
                        <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-1">
                            End Date (Before)
                        </label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="md:w-auto md:self-end">
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : trips.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <div key={trip.id} className="bg-card border border-border shadow rounded-lg overflow-hidden">
                            <div className="relative h-48">
                                <Image
                                    src={`/images/${trip.destination.toLowerCase()}.jpg`}
                                    alt={trip.destination}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold">{trip.title}</h2>
                                    <span className="status-badge open">
                                        {trip.participants.length}/{trip.maxParticipants} joined
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
                                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-6 line-clamp-3">{trip.description}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="relative w-10 h-10 mr-3">
                                            <Image
                                                src={trip.creatorImage}
                                                alt={trip.creatorName}
                                                fill
                                                className="rounded-full object-cover"
                                            />
                                        </div>
                                        <span className="text-sm text-foreground">{trip.creatorName}</span>
                                    </div>

                                    <Link
                                        href={`/trips/${trip.id}`}
                                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-foreground mb-2">No trips found</h3>
                    <p className="text-secondary mb-6">Try adjusting your search criteria or create your own trip!</p>
                    <Link
                        href="/trips/create"
                        className="bg-primary text-white px-6 py-3 rounded-md hover:bg-blue-700 transition"
                    >
                        Create a Trip
                    </Link>
                </div>
            )}
        </div>
    );
}

// Main component with Suspense boundary
export default function TripsPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        }>
            <TripsContent />
        </Suspense>
    );
}