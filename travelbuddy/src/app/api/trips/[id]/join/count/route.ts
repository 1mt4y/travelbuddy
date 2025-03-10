// app/api/trips/[id]/join/count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tripId = (await params).id;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the trip
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            select: {
                creatorId: true,
            },
        });

        if (!trip) {
            return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
        }

        // Check if user is the creator
        if (trip.creatorId !== session.user.id) {
            return NextResponse.json(
                { error: 'Not authorized to view these requests' },
                { status: 403 }
            );
        }

        // Count pending join requests for this trip
        const count = await prisma.joinRequest.count({
            where: {
                tripId,
                status: 'PENDING',
            },
        });

        return NextResponse.json({ count });

    } catch (error) {
        console.error('Error counting join requests:', error);
        return NextResponse.json(
            { error: 'Failed to count join requests', count: 0 },
            { status: 500 }
        );
    }
}