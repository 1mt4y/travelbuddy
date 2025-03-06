// app/profile/edit/page.tsx
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
};

export default function EditProfilePage() {
    const { status } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState<UserProfile>({
        id: '',
        name: '',
        email: '',
        dateOfBirth: null,
        nationality: null,
        bio: null,
        languages: [],
        profileImage: null
    });

    const [languagesInput, setLanguagesInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/profile/edit');
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
                setFormData(data);
                setLanguagesInput(data.languages.join(', '));
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            // Parse languages from comma-separated string
            const languages = languagesInput
                .split(',')
                .map(lang => lang.trim())
                .filter(lang => lang);

            const dataToSubmit = {
                ...formData,
                languages
            };

            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSubmit)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully!');

            // Scroll to top to show success message
            window.scrollTo(0, 0);
        } catch (err: unknown) {
            console.error('Error updating profile:', err);

            const errorMessage = err instanceof Error
                ? err.message
                : 'An error occurred while updating your profile';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

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
                <h1 className="text-3xl font-bold mb-8">Edit Your Profile</h1>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-md">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Update your profile information visible to other users.
                        </p>
                    </div>

                    <div className="px-4 py-5 sm:p-6">
                        <div className="mb-6 flex flex-col items-center">
                            <div className="mb-4">
                                {formData.profileImage ? (
                                    <Image
                                        src={formData.profileImage}
                                        alt={formData.name}
                                        width={120}
                                        height={120}
                                        className="h-32 w-32 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-32 w-32 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-semibold">
                                        {formData.name.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Profile Image URL
                                </label>
                                <input
                                    type="text"
                                    name="profileImage"
                                    value={formData.profileImage || ''}
                                    onChange={handleChange}
                                    placeholder="https://example.com/your-image.jpg"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Enter a URL for your profile image. For the MVP, we&apos;re not implementing file uploads.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={formData.email}
                                    disabled
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 cursor-not-allowed sm:text-sm"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Email cannot be changed. Contact support for assistance.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                                    Nationality
                                </label>
                                <input
                                    type="text"
                                    name="nationality"
                                    id="nationality"
                                    value={formData.nationality || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    id="dateOfBirth"
                                    value={formData.dateOfBirth || ''}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                                    Languages (comma separated)
                                </label>
                                <input
                                    type="text"
                                    name="languages"
                                    id="languages"
                                    value={languagesInput}
                                    onChange={(e) => setLanguagesInput(e.target.value)}
                                    placeholder="English, Spanish, French"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                                    About Me
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    rows={4}
                                    value={formData.bio || ''}
                                    onChange={handleChange}
                                    placeholder="Tell other travelers about yourself, your travel interests, etc."
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-3">
                        <Link
                            href="/profile"
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                                }`}
                        >
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}