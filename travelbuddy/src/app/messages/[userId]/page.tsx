// app/messages/[userId]/page.tsx
'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Message } from '@prisma/client'; // Add this import at the top

type User = {
    id: string;
    name: string;
    profileImage: string | null;
};

function ConversationContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const otherUserId = params.userId as string;

    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [messageSent, setMessageSent] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    // Track the last message ID for efficient polling
    const lastMessageIdRef = useRef<string | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?redirect=/messages');
        }
    }, [status, router]);

    // Fetch conversation
    const fetchConversation = useCallback(async () => {
        if (status !== 'authenticated') return;

        try {
            const response = await fetch(`/api/messages/${otherUserId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch conversation');
            }

            const data = await response.json();
            setOtherUser(data.otherUser);
            setMessages(data.messages);

            // Update last message ID for polling
            if (data.messages.length > 0) {
                lastMessageIdRef.current = data.messages[data.messages.length - 1].id;
            }

        } catch (err: unknown) {
            console.error('Error fetching conversation:', err);

            const errorMessage = err instanceof Error
                ? err.message
                : 'An error occurred while fetching the conversation';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [otherUserId, status]); // Dependencies

    // Initial fetch
    useEffect(() => {
        if (otherUserId) {
            fetchConversation();
        }
    }, [otherUserId, status, fetchConversation]); // Add fetchConversation


    // Polling mechanism for new messages
    useEffect(() => {
        // Only poll if authenticated and conversation is loaded
        if (status !== 'authenticated' || !otherUserId || loading) return;

        const pollInterval = setInterval(async () => {
            try {
                // Poll for new messages since the last message we have
                const response = await fetch(`/api/messages/${otherUserId}?since=${lastMessageIdRef.current || ''}`);

                if (!response.ok) {
                    throw new Error('Failed to poll for new messages');
                }

                const data = await response.json();

                // Only update if we have new messages
                if (data.messages && data.messages.length > 0) {
                    setMessages(prevMessages => {
                        // Combine existing messages with new ones, avoiding duplicates
                        const existingIds = new Set(prevMessages.map(m => m.id));
                        const uniqueNewMessages = data.messages.filter((m: Message) => !existingIds.has(m.id));

                        if (uniqueNewMessages.length > 0) {
                            // Update last message ID reference
                            lastMessageIdRef.current = uniqueNewMessages[uniqueNewMessages.length - 1].id;
                            return [...prevMessages, ...uniqueNewMessages];
                        }

                        return prevMessages;
                    });
                }
            } catch (err) {
                console.error('Error polling for messages:', err);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, [otherUserId, status, loading]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Clear message sent notification after delay
    useEffect(() => {
        if (messageSent) {
            const timer = setTimeout(() => {
                setMessageSent(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [messageSent]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !session) {
            return;
        }

        setSending(true);

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    receiverId: otherUserId,
                    content: newMessage.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // Add the new message to the messages list
            setMessages([...messages, data.message]);
            setNewMessage('');
            setMessageSent(true);

            // Update last message ID for polling
            lastMessageIdRef.current = data.message.id;

        } catch (err: unknown) {
            console.error('Error sending message:', err);
            const errorMessage = err instanceof Error
                ? err.message
                : 'An error occurred while sending the message';

            setError(errorMessage);
        } finally {
            setSending(false);
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

    if (!otherUser && !loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <h3 className="text-lg font-medium text-gray-900">User not found</h3>
                    <p className="mt-1 text-secondary">
                        The user you&apos;re trying to chat with doesn&apos;t exist or you don&apos;t have access.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/messages"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Back to Messages
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Group messages by date
    const groupedMessages: { [date: string]: Message[] } = {};

    messages.forEach(message => {
        const date = new Date(message.createdAt).toLocaleDateString();
        if (!groupedMessages[date]) {
            groupedMessages[date] = [];
        }
        groupedMessages[date].push(message);
    });

    const groupDates = Object.keys(groupedMessages).sort((a, b) =>
        new Date(a).getTime() - new Date(b).getTime()
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                    {/* Header */}
                    <div className="px-4 py-4 border-b flex items-center">
                        <Link
                            href="/messages"
                            className="mr-4 text-secondary hover:text-foreground"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="sr-only">Back</span>
                        </Link>

                        <div className="flex items-center">
                            <div className="mr-3">
                                {otherUser?.profileImage ? (
                                    <Image
                                        src={otherUser.profileImage}
                                        alt={otherUser.name}
                                        width={40}
                                        height={40}
                                        className="h-10 w-10 rounded-full"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                                        {otherUser?.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold">{otherUser?.name}</h2>
                                <div className="flex space-x-3">
                                    <Link
                                        href={`/profile/${otherUser?.id}`}
                                        className="text-sm text-blue-600 hover:underline"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                        {error && (
                            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {messageSent && (
                            <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md animate-fade-out">
                                Message sent successfully!
                            </div>
                        )}

                        {groupDates.length > 0 ? (
                            <>
                                {groupDates.map(date => (
                                    <div key={date}>
                                        <div className="flex justify-center my-4">
                                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                                {formatDate(date)}
                                            </span>
                                        </div>

                                        {groupedMessages[date].map((message) => {
                                            const isCurrentUser = message.senderId === session?.user.id;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${isCurrentUser
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white border border-border text-gray-800'
                                                            }`}
                                                    >
                                                        <p>{message.content}</p>
                                                        <p
                                                            className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-secondary'
                                                                }`}
                                                        >
                                                            {formatTime(message.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <svg
                                    className="h-12 w-12 text-gray-400 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                <p className="text-gray-600">
                                    No messages yet. Start the conversation!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t">
                        <form onSubmit={handleSendMessage} className="flex">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-card text-foreground border border-border rounded-l-md focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                className={`px-4 py-2 bg-primary text-white rounded-r-md focus:outline-none ${sending || !newMessage.trim()
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-700'
                                    }`}
                            >
                                {sending ? (
                                    <span className="flex items-center">
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Sending
                                    </span>
                                ) : (
                                    'Send'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main component with Suspense boundary
export default function ConversationPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        }>
            <ConversationContent />
        </Suspense>
    );
}