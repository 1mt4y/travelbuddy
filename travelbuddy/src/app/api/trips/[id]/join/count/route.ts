// src/app/api/trips/[id]/join/count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// This route is dedicated to counting pending join requests for a trip
export async function GET(
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
        // First check if the user is the creator of the trip
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            select: {
                id: true,
                creatorId: true,
            },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // If the user is not the creator, return zero
        if (trip.creatorId !== session.user.id) {
            return NextResponse.json({ count: 0 });
        }

        // Count pending join requests
        const count = await prisma.joinRequest.count({
            where: {
                tripId: tripId,
                status: 'PENDING',
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting pending requests:', error);
        return NextResponse.json(
            { error: 'Failed to count pending requests' },
            { status: 500 }
        );
    }
}