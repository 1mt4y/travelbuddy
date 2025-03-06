// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type UserProfile = {
    id: string;
    name: string;
    email: string;
    dateOfBirth: string | null;
    nationality: string | null;
    bio: string | null;
    languages: string[];
    profileImage: string | null;
    createdAt: string;
};

export default function ProfilePage() {
    const { status } = useSession();
    const router = useRouter();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/profile');
        }
    }, [status, router]);

    // Fetch profile
    useEffect(() => {
        const fetchProfile = async () => {
            if (status !== 'authenticated') return;

            try {
                const response = await fetch('/api/users/profile');

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err: unknown) {
                console.error('Error fetching profile:', err);
                const errorMessage = err instanceof Error
                    ? err.message
                    : 'An error occurred while fetching your profile';

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
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
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex justify-between items-center">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                        <Link
                            href="/profile/edit"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Edit Profile
                        </Link>
                    </div>

                    {profile ? (
                        <div className="px-4 py-5 sm:p-6">
                            <div className="sm:flex sm:items-center">
                                <div className="mb-4 sm:mb-0 sm:mr-6 flex justify-center">
                                    {profile.profileImage ? (
                                        <Image
                                            src={profile.profileImage}
                                            alt={profile.name}
                                            width={120}
                                            height={120}
                                            className="h-32 w-32 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-semibold">
                                            {profile.name.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <div className="sm:flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                                    <p className="text-gray-500 mb-4">
                                        Member since {new Date(profile.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long' })}
                                    </p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {profile.languages.map((language, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {language}
                                            </span>
                                        ))}
                                    </div>

                                    {profile.nationality && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">From:</span> {profile.nationality}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 border-t border-gray-200 pt-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">About Me</h3>
                                    {profile.bio ? (
                                        <p className="text-gray-600 whitespace-pre-line">{profile.bio}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">
                                            No bio added yet. Tell others about yourself by editing your profile.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
                                    <p className="text-gray-600 mb-2">
                                        <span className="font-medium">Email:</span> {profile.email}
                                    </p>
                                    {profile.dateOfBirth && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Date of Birth:</span>{' '}
                                            {new Date(profile.dateOfBirth).toLocaleDateString([], {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="px-4 py-5 sm:p-6 text-center">
                            <p className="text-gray-500">
                                Unable to load profile information. Please try again later.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <Link
                        href="/profile/trips"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        View Your Trips
                    </Link>
                </div>
            </div>
        </div>
    );
}

