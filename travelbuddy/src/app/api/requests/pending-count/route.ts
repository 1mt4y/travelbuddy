// app/api/requests/pending-count/route.ts
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

        // Count all pending requests for trips created by the user
        const count = await prisma.joinRequest.count({
            where: {
                receiverId: session.user.id,
                status: 'PENDING',
            },
        });

        return NextResponse.json({ count });

    } catch (error) {
        console.error('Error counting pending requests:', error);
        return NextResponse.json(
            { error: 'Failed to count pending requests', count: 0 },
            { status: 500 }
        );
    }
}