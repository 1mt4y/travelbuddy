// components/footer.tsx
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-xl font-bold mb-4">TravelBuddy</h2>
                        <p className="text-gray-300 mb-4">
                            Connect with travelers, share journeys, and make new friends along the way.
                            Find the perfect travel companion for your next adventure.
                        </p>
                        <p className="text-gray-400 text-sm">
                            &copy; {currentYear} TravelBuddy. All rights reserved.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Explore</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/trips" className="text-gray-300 hover:text-white">
                                    Find Trips
                                </Link>
                            </li>
                            <li>
                                <Link href="/trips/create" className="text-gray-300 hover:text-white">
                                    Create a Trip
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile/trips" className="text-gray-300 hover:text-white">
                                    My Trips
                                </Link>
                            </li>
                            <li>
                                <Link href="/messages" className="text-gray-300 hover:text-white">
                                    Messages
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Account</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/auth/login" className="text-gray-300 hover:text-white">
                                    Sign In
                                </Link>
                            </li>
                            <li>
                                <Link href="/auth/register" className="text-gray-300 hover:text-white">
                                    Sign Up
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile" className="text-gray-300 hover:text-white">
                                    Profile
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
}