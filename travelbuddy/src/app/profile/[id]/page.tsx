// app/profile/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

type UserProfile = {
    id: string;
    name: string;
    nationality: string | null;
    bio: string | null;
    languages: string[];
    profileImage: string | null;
    createdAt: string;
    createdTrips: {
        id: string;
        title: string;
        destination: string;
        startDate: string;
        endDate: string;
    }[];
};

export default function PublicProfilePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/users/${userId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('User not found');
                    }
                    throw new Error('Failed to fetch user profile');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'An error occurred while fetching the user profile');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    // If it's your own profile, redirect to the profile page
    useEffect(() => {
        if (session && userId === session.user.id) {
            router.push('/profile');
        }
    }, [session, userId, router]);

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
                    <p className="text-gray-700 mb-6">{error}</p>
                    <Link href="/trips" className="text-blue-600 hover:underline">
                        Browse all trips
                    </Link>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h2 className="text-2xl font-bold mb-4">User not found</h2>
                    <p className="text-gray-700 mb-6">The user you're looking for doesn't exist or has been removed.</p>
                    <Link href="/trips" className="text-blue-600 hover:underline">
                        Browse all trips
                    </Link>
                </div>
            </div>
        );
    }

    const formattedJoinDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-6 sm:px-6">
                        <div className="flex flex-col sm:flex-row items-center">
                            <div className="mb-4 sm:mb-0 sm:mr-6">
                                {profile.profileImage ? (
                                    <div className="relative h-24 w-24 sm:h-32 sm:w-32">
                                        <Image
                                            src={profile.profileImage}
                                            alt={profile.name}
                                            fill
                                            className="rounded-full object-cover border-4 border-white"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-4xl font-semibold border-4 border-white">
                                        {profile.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">{profile.name}</h1>
                                <p className="text-blue-100 mt-1">
                                    Member since {formattedJoinDate}
                                </p>
                                {profile.nationality && (
                                    <p className="text-white mt-2">
                                        From {profile.nationality}
                                    </p>
                                )}
                                {session && (
                                    <div className="mt-4">
                                        <Link
                                            href={`/messages/${profile.id}`}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            Message
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="px-4 py-5 sm:px-6">
                        {/* Languages */}
                        {profile.languages && profile.languages.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">Languages</h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.languages.map((language, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                            {language}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* About */}
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
                            {profile.bio ? (
                                <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
                            ) : (
                                <p className="text-gray-500 italic">This user hasn't added a bio yet.</p>
                            )}
                        </div>

                        {/* Recent Trips */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Recent Trips</h2>
                            {profile.createdTrips && profile.createdTrips.length > 0 ? (
                                <div className="grid gap-4">
                                    {profile.createdTrips.map((trip) => (
                                        <Link
                                            key={trip.id}
                                            href={`/trips/${trip.id}`}
                                            className="block bg-gray-50 hover:bg-gray-100 p-4 rounded-md"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-blue-600">{trip.title}</h3>
                                                    <p className="text-gray-600">{trip.destination}</p>
                                                </div>
                                                <div className="text-right text-sm text-gray-500">
                                                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">This user hasn't created any public trips yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}