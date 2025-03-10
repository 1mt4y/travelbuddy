// app/api/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get all trips created by the user
        const createdTrips = await prisma.trip.findMany({
            where: {
                creatorId: session.user.id,
            },
            select: {
                id: true,
                title: true,
                destination: true,
                joinRequests: {
                    where: {
                        status: 'PENDING',
                    },
                    select: {
                        id: true,
                    },
                },
            },
        });

        // 2. Get all pending requests for trips created by the user
        const pendingRequests = await prisma.joinRequest.findMany({
            where: {
                receiverId: session.user.id,
                status: 'PENDING',
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    },
                },
                trip: {
                    select: {
                        id: true,
                        title: true,
                        destination: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 3. Get previous (non-pending) requests for trips created by the user
        const previousRequests = await prisma.joinRequest.findMany({
            where: {
                receiverId: session.user.id,
                status: {
                    not: 'PENDING',
                },
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    },
                },
                trip: {
                    select: {
                        id: true,
                        title: true,
                        destination: true,
                        startDate: true,
                        endDate: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: 10, // Limit to most recent 10
        });

        // Format the created trips with counts
        const formattedTrips = createdTrips.map(trip => ({
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            pendingRequestsCount: trip.joinRequests.length,
        }));

        return NextResponse.json({
            pendingRequests,
            previousRequests,
            createdTrips: formattedTrips,
        });

    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch requests' },
            { status: 500 }
        );
    }
}
