// app/api/messages/unread-count/route.ts
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

        // Count all unread messages for the user
        const count = await prisma.message.count({
            where: {
                receiverId: session.user.id,
                isRead: false,
            },
        });

        return NextResponse.json({ count });

    } catch (error) {
        console.error('Error counting unread messages:', error);
        return NextResponse.json(
            { error: 'Failed to count unread messages', count: 0 },
            { status: 500 }
        );
    }
}