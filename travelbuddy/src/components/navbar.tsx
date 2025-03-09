// components/navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export default function Navbar() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

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
        <nav className="bg-card border-b border-border shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-primary font-bold text-2xl" onClick={closeMenus}>
                                TravelBuddy
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/'
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-secondary hover:border-border hover:text-foreground'
                                    }`}
                                onClick={closeMenus}
                            >
                                Home
                            </Link>
                            <Link
                                href="/trips"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/trips' || pathname.startsWith('/trips/')
                                    ? 'border-primary text-foreground'
                                    : 'border-transparent text-secondary hover:border-border hover:text-foreground'
                                    }`}
                                onClick={closeMenus}
                            >
                                Explore Trips
                            </Link>
                            {status === 'authenticated' && (
                                <>
                                    <Link
                                        href="/messages"
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/messages' || pathname.startsWith('/messages/')
                                            ? 'border-primary text-foreground'
                                            : 'border-transparent text-secondary hover:border-border hover:text-foreground'
                                            }`}
                                        onClick={closeMenus}
                                    >
                                        Messages
                                    </Link>
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
                                        className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        id="user-menu"
                                        aria-expanded="false"
                                        aria-haspopup="true"
                                        onClick={toggleProfileMenu}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        {session.user.image ? (
                                            <div className="relative h-8 w-8 border-2 border-primary rounded-full overflow-hidden">
                                                <Image
                                                    className="rounded-full"
                                                    src={session.user.image}
                                                    alt=""
                                                    fill
                                                />
                                            </div>
                                        ) : (
                                            <div className="navbar-avatar">
                                                {session.user.name?.[0] || 'U'}
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {isProfileMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-card ring-1 ring-black ring-opacity-5 focus:outline-none z-10 border border-border"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu"
                                    >
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-secondary-light"
                                            role="menuitem"
                                            onClick={closeMenus}
                                        >
                                            Your Profile
                                        </Link>
                                        <Link
                                            href="/profile/trips"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-secondary-light"
                                            role="menuitem"
                                            onClick={closeMenus}
                                        >
                                            Your Trips
                                        </Link>
                                        <button
                                            className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-secondary-light"
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
                                    className="text-foreground hover:text-primary font-medium"
                                    onClick={closeMenus}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-hover"
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
                            className="inline-flex items-center justify-center p-2 rounded-md text-secondary hover:text-foreground hover:bg-secondary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
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
                            ? 'bg-primary-light border-primary text-primary-dark'
                            : 'border-transparent text-secondary hover:bg-secondary-light hover:border-border hover:text-foreground'
                            }`}
                        onClick={closeMenus}
                    >
                        Home
                    </Link>
                    <Link
                        href="/trips"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/trips' || pathname.startsWith('/trips/')
                            ? 'bg-primary-light border-primary text-primary-dark'
                            : 'border-transparent text-secondary hover:bg-secondary-light hover:border-border hover:text-foreground'
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
                                    ? 'bg-primary-light border-primary text-primary-dark'
                                    : 'border-transparent text-secondary hover:bg-secondary-light hover:border-border hover:text-foreground'
                                    }`}
                                onClick={closeMenus}
                            >
                                Messages
                            </Link>
                        </>
                    )}
                </div>
                {status === 'authenticated' ? (
                    <div className="pt-4 pb-3 border-t border-border">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                {session.user.image ? (
                                    <div className="relative h-10 w-10 border-2 border-primary rounded-full overflow-hidden">
                                        <Image
                                            className="rounded-full"
                                            src={session.user.image}
                                            alt=""
                                            fill
                                        />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                                        {session.user.name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-foreground">{session.user.name}</div>
                                <div className="text-sm font-medium text-secondary">{session.user.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 space-y-1">
                            <Link
                                href="/profile"
                                className="block px-4 py-2 text-base font-medium text-secondary hover:text-foreground hover:bg-secondary-light"
                                onClick={closeMenus}
                            >
                                Your Profile
                            </Link>
                            <Link
                                href="/profile/trips"
                                className="block px-4 py-2 text-base font-medium text-secondary hover:text-foreground hover:bg-secondary-light"
                                onClick={closeMenus}
                            >
                                Your Trips
                            </Link>
                            <button
                                className="w-full text-left block px-4 py-2 text-base font-medium text-secondary hover:text-foreground hover:bg-secondary-light"
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
                    <div className="pt-4 pb-3 border-t border-border">
                        <div className="space-y-1">
                            <Link
                                href="/auth/login"
                                className="block px-4 py-2 text-base font-medium text-secondary hover:text-foreground hover:bg-secondary-light"
                                onClick={closeMenus}
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/auth/register"
                                className="block px-4 py-2 text-base font-medium text-secondary hover:text-foreground hover:bg-secondary-light"
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