// src/app/api/trips/[id]/join/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// This route handles POST requests to join a trip
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const tripId = (await params).id;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Get the trip details
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            include: {
                participants: true,
            },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Check if user is already participating
        const isParticipant = trip.participants.some(
            (p) => p.userId === session.user.id
        );

        if (isParticipant) {
            return NextResponse.json(
                { error: 'You are already participating in this trip' },
                { status: 400 }
            );
        }

        // Check if user has already requested to join
        const existingRequest = await prisma.joinRequest.findFirst({
            where: {
                tripId,
                senderId: session.user.id,
                status: 'PENDING',
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: 'You have already requested to join this trip' },
                { status: 400 }
            );
        }

        // Create a join request
        const joinRequest = await prisma.joinRequest.create({
            data: {
                message,
                senderId: session.user.id,
                receiverId: trip.creatorId,
                tripId,
            },
        });

        return NextResponse.json({ success: true, joinRequest });
    } catch (error) {
        console.error('Error creating join request:', error);
        return NextResponse.json(
            { error: 'Failed to create join request' },
            { status: 500 }
        );
    }
}

// This endpoint now only handles creating requests
// For getting trip requests, use /api/trips/[id]/requests instead