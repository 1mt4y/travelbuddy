// Enhanced navbar.tsx with requests notifications
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Add scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch pending requests count for trip creators
    useEffect(() => {
        if (status === 'authenticated') {
            const fetchPendingRequests = async () => {
                try {
                    const response = await fetch('/api/requests/pending-count');
                    if (response.ok) {
                        const data = await response.json();
                        setPendingRequests(data.count);
                    }
                } catch (error) {
                    console.error('Error fetching pending requests:', error);
                }
            };

            const fetchUnreadMessages = async () => {
                try {
                    const response = await fetch('/api/messages/unread-count');
                    if (response.ok) {
                        const data = await response.json();
                        setUnreadMessages(data.count);
                    }
                } catch (error) {
                    console.error('Error fetching unread messages:', error);
                }
            };

            fetchPendingRequests();
            fetchUnreadMessages();

            // Poll for updates every 60 seconds
            const intervalId = setInterval(() => {
                fetchPendingRequests();
                fetchUnreadMessages();
            }, 60000);

            return () => clearInterval(intervalId);
        }
    }, [status]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
        if (isMenuOpen) setIsMenuOpen(false);
    };

    const closeMenus = () => {
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
    };

    return (
        <nav className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-blue-600 font-bold text-2xl" onClick={closeMenus}>
                                TravelBuddy
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/'
                                    ? 'border-blue-600 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                onClick={closeMenus}
                            >
                                Home
                            </Link>
                            <Link
                                href="/trips"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/trips' || pathname.startsWith('/trips/')
                                    ? 'border-blue-600 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                onClick={closeMenus}
                            >
                                Explore Trips
                            </Link>
                            {status === 'authenticated' && (
                                <>
                                    <Link
                                        href="/messages"
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/messages' || pathname.startsWith('/messages/')
                                            ? 'border-blue-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            } relative`}
                                        onClick={closeMenus}
                                    >
                                        Messages
                                        {unreadMessages > 0 && (
                                            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {unreadMessages}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        href="/profile/trips"
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/profile/trips'
                                            ? 'border-blue-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                        onClick={closeMenus}
                                    >
                                        My Trips
                                    </Link>
                                    {pendingRequests > 0 && (
                                        <Link
                                            href="/requests"
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${pathname === '/requests'
                                                ? 'border-blue-600 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                } relative`}
                                            onClick={closeMenus}
                                        >
                                            Requests
                                            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {pendingRequests}
                                            </span>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {status === 'authenticated' ? (
                            <div className="ml-3 relative">
                                <div>
                                    <button
                                        type="button"
                                        className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        id="user-menu"
                                        aria-expanded="false"
                                        aria-haspopup="true"
                                        onClick={toggleProfileMenu}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        {session.user.image ? (
                                            <div className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-blue-100 hover:ring-blue-300 transition-all duration-200">
                                                <Image
                                                    className="rounded-full"
                                                    src={session.user.image}
                                                    alt=""
                                                    fill
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold ring-2 ring-blue-100 hover:ring-blue-300 transition-all duration-200">
                                                {session.user.name?.[0] || 'U'}
                                            </div>
                                        )}
                                        {pendingRequests > 0 && (
                                            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {pendingRequests}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                {isProfileMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-gray-200"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu"
                                    >
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                                            role="menuitem"
                                            onClick={closeMenus}
                                        >
                                            Your Profile
                                        </Link>
                                        <Link
                                            href="/profile/trips"
                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                                            role="menuitem"
                                            onClick={closeMenus}
                                        >
                                            Your Trips
                                        </Link>
                                        {pendingRequests > 0 && (
                                            <Link
                                                href="/requests"
                                                className="block px-4 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200 transition-colors relative"
                                                role="menuitem"
                                                onClick={closeMenus}
                                            >
                                                <div className="flex items-center">
                                                    <span className="text-red-600 font-medium">Trip Requests</span>
                                                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                        {pendingRequests}
                                                    </span>
                                                </div>
                                            </Link>
                                        )}
                                        <button
                                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                                            role="menuitem"
                                            onClick={() => {
                                                closeMenus();
                                                signOut({ callbackUrl: '/' });
                                            }}
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/auth/login"
                                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    onClick={closeMenus}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm hover:shadow transition-all"
                                    onClick={closeMenus}
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded="false"
                            onClick={toggleMenu}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg
                                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <svg
                                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        href="/"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/'
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        onClick={closeMenus}
                    >
                        Home
                    </Link>
                    <Link
                        href="/trips"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/trips' || pathname.startsWith('/trips/')
                            ? 'bg-blue-50 border-blue-600 text-blue-700'
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        onClick={closeMenus}
                    >
                        Explore Trips
                    </Link>
                    {status === 'authenticated' && (
                        <>
                            <Link
                                href="/messages"
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/messages' || pathname.startsWith('/messages/')
                                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                    } relative`}
                                onClick={closeMenus}
                            >
                                <div className="flex items-center">
                                    Messages
                                    {unreadMessages > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {unreadMessages}
                                        </span>
                                    )}
                                </div>
                            </Link>
                            <Link
                                href="/profile/trips"
                                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/profile/trips'
                                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                                onClick={closeMenus}
                            >
                                My Trips
                            </Link>
                            {pendingRequests > 0 && (
                                <Link
                                    href="/requests"
                                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/requests'
                                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                        }`}
                                    onClick={closeMenus}
                                >
                                    <div className="flex items-center">
                                        <span className="text-red-600 font-medium">Trip Requests</span>
                                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                            {pendingRequests}
                                        </span>
                                    </div>
                                </Link>
                            )}
                        </>
                    )}
                </div>
                {status === 'authenticated' ? (
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                {session.user.image ? (
                                    <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-blue-100">
                                        <Image
                                            className="rounded-full"
                                            src={session.user.image}
                                            alt=""
                                            fill
                                        />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium ring-2 ring-blue-100">
                                        {session.user.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-gray-800">{session.user.name}</div>
                                <div className="text-sm font-medium text-gray-500">{session.user.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                href="/profile"
                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                onClick={closeMenus}
                            >
                                Your Profile
                            </Link>
                            <Link
                                href="/profile/trips"
                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                onClick={closeMenus}
                            >
                                Your Trips
                            </Link>
                            <button
                                className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                onClick={() => {
                                    closeMenus();
                                    signOut({ callbackUrl: '/' });
                                }}
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        <div className="space-y-1">
                            <Link
                                href="/auth/login"
                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                onClick={closeMenus}
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/auth/register"
                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                onClick={closeMenus}
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}