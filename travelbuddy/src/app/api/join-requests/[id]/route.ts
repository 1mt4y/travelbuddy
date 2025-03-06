// app/api/trips/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Send a request to join a trip
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const tripId = (await context.params).id;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to request to join a trip" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Check if the trip exists
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
            include: {
                participants: true,
            },
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        // Check if the user is already a participant
        const isParticipant = trip.participants.some(p => p.userId === userId);
        if (isParticipant) {
            return NextResponse.json(
                { error: "You are already a participant in this trip" },
                { status: 400 }
            );
        }

        // Check if the trip is full
        if (trip.participants.length >= trip.maxParticipants) {
            return NextResponse.json(
                { error: "This trip is full" },
                { status: 400 }
            );
        }

        // Check if the user has already requested to join
        const existingRequest = await prisma.joinRequest.findFirst({
            where: {
                tripId,
                senderId: userId,
            },
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "You have already requested to join this trip" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { message } = body;

        if (!message || !message.trim()) {
            return NextResponse.json(
                { error: "A message is required when requesting to join a trip" },
                { status: 400 }
            );
        }

        // Create the join request
        const joinRequest = await prisma.joinRequest.create({
            data: {
                tripId,
                senderId: userId,
                receiverId: trip.creatorId,
                message,
            },
        });

        // Send a message to the trip creator
        await prisma.message.create({
            data: {
                senderId: userId,
                receiverId: trip.creatorId,
                content: `Hi! I've sent a request to join your trip to ${trip.destination}. Looking forward to your response!`,
            },
        });

        return NextResponse.json({
            message: "Join request sent successfully",
            joinRequest,
        });
    } catch (error) {
        console.error("Error sending join request:", error);
        return NextResponse.json(
            { error: "An error occurred while sending the join request" },
            { status: 500 }
        );
    }
}

// Get all join requests for a trip (only creator can do this)
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const tripId = (await context.params).id;
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to view join requests" },
                { status: 401 }
            );
        }

        // Check if the trip exists and the user is the creator
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId,
            },
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        if (trip.creatorId !== session.user.id) {
            return NextResponse.json(
                { error: "Only the trip creator can view join requests" },
                { status: 403 }
            );
        }

        // Get all join requests for this trip
        const joinRequests = await prisma.joinRequest.findMany({
            where: {
                tripId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        nationality: true,
                        languages: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(joinRequests);
    } catch (error) {
        console.error("Error fetching join requests:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching join requests" },
            { status: 500 }
        );
    }
}