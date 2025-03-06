// app/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type Conversation = {
    contact: {
        id: string;
        name: string;
        profileImage: string | null;
    };
    lastMessage: {
        id: string;
        content: string;
        isRead: boolean;
        createdAt: string;
        senderId: string;
        receiverId: string;
    };
    unreadCount: number;
};

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/messages');
        }
    }, [status, router]);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            if (status !== 'authenticated') return;

            try {
                const response = await fetch('/api/messages');

                if (!response.ok) {
                    throw new Error('Failed to fetch conversations');
                }

                const data = await response.json();
                setConversations(data);
            } catch (err: any) {
                console.error('Error fetching conversations:', err);
                setError(err.message || 'An error occurred while fetching conversations');
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        // If today, show time
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // If this year, show month and day
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }

        // Otherwise show full date
        return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Messages</h1>

            {error && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-md">
                    {error}
                </div>
            )}

            {conversations.length > 0 ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {conversations.map((conversation) => (
                            <li key={conversation.contact.id}>
                                <Link
                                    href={`/messages/${conversation.contact.id}`}
                                    className="block hover:bg-gray-50"
                                >
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 mr-4">
                                                {conversation.contact.profileImage ? (
                                                    <Image
                                                        src={conversation.contact.profileImage}
                                                        alt={conversation.contact.name}
                                                        width={48}
                                                        height={48}
                                                        className="h-12 w-12 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                                                        {conversation.contact.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {conversation.contact.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(conversation.lastMessage.createdAt)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <p className={`text-sm ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
                                                        } truncate`}>
                                                        {conversation.lastMessage.senderId === session?.user.id ? (
                                                            <span className="text-gray-400">You: </span>
                                                        ) : null}
                                                        {conversation.lastMessage.content}
                                                    </p>

                                                    {conversation.unreadCount > 0 && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {conversation.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="mb-4">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                    </div>

                    <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                    <p className="mt-1 text-gray-500">
                        Browse trips and connect with other travelers to start conversations.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/trips"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Find Travel Buddies
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
