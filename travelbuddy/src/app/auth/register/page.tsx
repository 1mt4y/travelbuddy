// app/auth/register/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Separate component for the register form
function RegisterForm() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        nationality: '',
        languages: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { name, email, password, confirmPassword, dateOfBirth, nationality, languages } = formData;

        // Basic validation
        if (!name || !email || !password) {
            setError('Name, email, and password are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setError('');
            setLoading(true);

            // Parse languages into an array
            const languagesArray = languages
                ? languages.split(',').map((lang) => lang.trim())
                : [];

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    dateOfBirth: dateOfBirth || undefined,
                    nationality: nationality || undefined,
                    languages: languagesArray,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Redirect to login page after successful registration
            router.push('/auth/login?success=true');

        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>

                {error && (
                    <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 appearance-none block w-full bg-card text-foreground px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 appearance-none block w-full bg-card text-foreground px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 appearance-none block w-full bg-card text-foreground px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="At least 8 characters"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="mt-1 appearance-none block w-full bg-card text-foreground px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Confirm your password"
                            />
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                                Date of Birth
                            </label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="mt-1 appearance-none block w-full bg-card text-foreground px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                                Nationality
                            </label>
                            <input
                                id="nationality"
                                name="nationality"
                                type="text"
                                value={formData.nationality}
                                onChange={handleChange}
                                className="mt-1 appearance-none block w-full bg-card text-foreground px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="e.g. American, French, Japanese"
                            />
                        </div>

                        <div>
                            <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                                Languages (comma separated)
                            </label>
                            <input
                                id="languages"
                                name="languages"
                                type="text"
                                value={formData.languages}
                                onChange={handleChange}
                                className="mt-1 appearance-none block w-full bg-card text-foreground px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="e.g. English, Spanish, French"
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Main component with Suspense
export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
}