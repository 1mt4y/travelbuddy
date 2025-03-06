// app/trips/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Trip = {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    description: string;
    activities: string[];
    maxParticipants: number;
    participants: {
        id: string;
        name: string;
        image: string;
    }[];
    creator: {
        id: string;
        name: string;
        image: string;
        bio: string;
        languages: string[];
    };
};

export default function TripDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.id as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userHasRequested, setUserHasRequested] = useState(false);
    const [showContactForm, setShowContactForm] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Mock authentication for demo purposes
        setIsAuthenticated(true);

        // In a real app, this would be an API call
        setTimeout(() => {
            // Mock trip data
            const mockTrip: Trip = {
                id: tripId,
                title: "Exploring Rome and Florence",
                destination: "Italy",
                startDate: "2025-03-15",
                endDate: "2025-03-22",
                description: "Looking for 2-3 people to join me on a cultural tour of Rome and Florence. Planning to visit museums, historical sites, and enjoy authentic Italian cuisine. The trip will start in Rome, where we&apos;ll spend 4 days exploring the Colosseum, Vatican, and other sites. Then we&apos;ll take a train to Florence for 3 days to see the Uffizi Gallery, Duomo, and enjoy Tuscan food and wine.",
                activities: [
                    "Museum visits",
                    "Historical sites",
                    "Food tours",
                    "Photography",
                    "Shopping"
                ],
                maxParticipants: 4,
                participants: [
                    {
                        id: "user1",
                        name: "Alex Johnson",
                        image: "/images/user1.jpg"
                    }
                ],
                creator: {
                    id: "user1",
                    name: "Alex Johnson",
                    image: "/images/user1.jpg",
                    bio: "Avid traveler and photography enthusiast. I&apos;ve visited 25 countries and love meeting new people during my trips.",
                    languages: ["English", "Spanish", "Basic Italian"]
                }
            };

            setTrip(mockTrip);
            setLoading(false);
        }, 1000);
    }, [tripId]);

    const handleJoinRequest = () => {
        if (!isAuthenticated) {
            router.push("/auth/login?redirect=" + encodeURIComponent(`/trips/${tripId}`));
            return;
        }

        setShowContactForm(true);
    };

    const sendRequest = () => {
        if (!message.trim()) return;

        setIsJoining(true);

        // In a real app, this would be an API call
        setTimeout(() => {
            setIsJoining(false);
            setUserHasRequested(true);
            setShowContactForm(false);
        }, 1000);
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

    if (!trip) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Trip not found</h1>
                    <p className="mb-6">The trip you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Link href="/trips" className="text-blue-600 hover:underline">
                        Browse all trips
                    </Link>
                </div>
            </div>
        );
    }

    const isFull = trip.participants.length >= trip.maxParticipants;
    const isCreator = isAuthenticated && trip.creator.id === "currentUserId"; // In a real app, this would check against actual user ID

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/trips" className="flex items-center text-blue-600 mb-6 hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to all trips
            </Link>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Trip Header */}
                <div className="relative h-64 md:h-80">
                    <Image
                        src={`/images/${trip.destination.toLowerCase()}.jpg`}
                        alt={trip.destination}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
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
                                <p className="text-gray-700 whitespace-pre-line">{trip.description}</p>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Activities</h2>
                                <div className="flex flex-wrap gap-2">
                                    {trip.activities.map((activity, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                            {activity}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold mb-4">Travel Buddies</h2>
                                <p className="text-gray-600 mb-4">
                                    {trip.participants.length} out of {trip.maxParticipants} travelers joined
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    {trip.participants.map((participant) => (
                                        <div key={participant.id} className="flex flex-col items-center">
                                            <div className="relative w-16 h-16 mb-2">
                                                <Image
                                                    src={participant.image}
                                                    alt={participant.name}
                                                    fill
                                                    className="rounded-full object-cover"
                                                />
                                            </div>
                                            <span className="text-sm">{participant.name}</span>
                                            {participant.id === trip.creator.id && (
                                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full mt-1">
                                                    Host
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {Array.from({ length: trip.maxParticipants - trip.participants.length }).map((_, index) => (
                                        <div key={`empty-${index}`} className="flex flex-col items-center">
                                            <div className="w-16 h-16 mb-2 rounded-full bg-gray-200 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm text-gray-500">Available</span>
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
                                    <div className="relative w-16 h-16 mr-4">
                                        <Image
                                            src={trip.creator.image}
                                            alt={trip.creator.name}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{trip.creator.name}</h4>
                                        <Link href={`/profile/${trip.creator.id}`} className="text-blue-600 text-sm hover:underline">
                                            View Profile
                                        </Link>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-medium mb-2">Bio</h4>
                                    <p className="text-sm text-gray-700">{trip.creator.bio}</p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Languages</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {trip.creator.languages.map((language, index) => (
                                            <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                                                {language}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Join Trip */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6">
                                {isCreator ? (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Manage Your Trip</h3>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                            >
                                                Edit Trip Details
                                            </button>
                                            <button
                                                className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition"
                                            >
                                                Manage Participants
                                            </button>
                                        </div>
                                    </div>
                                ) : userHasRequested ? (
                                    <div className="text-center">
                                        <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <h3 className="font-semibold mb-1">Request Sent!</h3>
                                            <p className="text-sm">The trip host will respond to your request soon.</p>
                                        </div>
                                        <Link
                                            href="/messages"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            View your messages
                                        </Link>
                                    </div>
                                ) : showContactForm ? (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Send a Message to Join</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Introduce yourself and explain why you&apos;d like to join this trip.
                                        </p>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            rows={5}
                                            className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Hi Alex! I&apos;m interested in joining your Italy trip. I love museums and Italian food too..."
                                        ></textarea>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={sendRequest}
                                                disabled={isJoining || !message.trim()}
                                                className={`flex-1 px-4 py-2 rounded-md transition ${isJoining || !message.trim()
                                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                                    }`}
                                            >
                                                {isJoining ? "Sending..." : "Send Request"}
                                            </button>
                                            <button
                                                onClick={() => setShowContactForm(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Interested in this trip?</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            {isFull
                                                ? "This trip is currently full, but you can still send a request in case a spot opens up."
                                                : "Send a request to join and connect with the trip host."}
                                        </p>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-gray-600">Spots available:</span>
                                            <span className="font-medium">
                                                {trip.maxParticipants - trip.participants.length} / {trip.maxParticipants}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleJoinRequest}
                                            className={`w-full px-4 py-2 rounded-md transition ${isFull
                                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                                }`}
                                        >
                                            {isFull ? "Join Waitlist" : "Request to Join"}
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