// src/app/api/trips/[id]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to join a trip" },
                { status: 401 }
            );
        }

        const tripId = (await context.params).id;
        const userId = session.user.id;
        const body = await request.json();
        const { message } = body;

        // Check if trip exists
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                participants: true
            }
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        // Check if user is already a participant
        const isParticipant = trip.participants.some(p => p.userId === userId);
        if (isParticipant) {
            return NextResponse.json(
                { error: "You are already a participant in this trip" },
                { status: 400 }
            );
        }

        // Check if user has already sent a request
        const existingRequest = await prisma.joinRequest.findFirst({
            where: {
                tripId,
                senderId: userId,
                status: "PENDING"
            }
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "You have already sent a join request for this trip" },
                { status: 400 }
            );
        }

        // Create join request
        const joinRequest = await prisma.joinRequest.create({
            data: {
                message: message || "I would like to join your trip!",
                tripId,
                senderId: userId,
                receiverId: trip.creatorId
            }
        });

        return NextResponse.json({
            message: "Join request sent successfully",
            joinRequest
        });
    } catch (error) {
        console.error("Error sending join request:", error);
        return NextResponse.json(
            { error: "An error occurred while sending the join request" },
            { status: 500 }
        );
    }
}

// GET method to check if user has already requested to join
// GET /api/trips/[tripId]/join
// This should handle both:
// 1. Trip creators requesting to see all join requests
// 2. Regular users checking their request status

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const tripId = (await params).id;

        console.log(`Debug - userId: ${userId}, tripId: ${tripId}`); // Debug log

        // First, check if the user is the trip creator
        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            select: { creatorId: true }
        });

        console.log(`Debug - trip found:`, trip); // Debug log


        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        // If the user is the trip creator, return all join requests
        if (userId === trip.creatorId) {
            console.log(`Debug - User is trip creator, fetching requests`); // Debug log
            const joinRequests = await prisma.joinRequest.findMany({
                where: {
                    id: tripId,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            profileImage: true,
                            nationality: true,
                            languages: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            console.log(joinRequests);

            return NextResponse.json(joinRequests);
        }
        // Otherwise, check the user's join request status
        else {
            // Check if user is already a participant
            const participant = await prisma.userTrip.findFirst({
                where: {
                    id: tripId,
                    userId: userId
                }
            });

            if (participant) {
                return NextResponse.json({
                    status: "JOINED",
                    message: "You are already a member of this trip"
                });
            }

            // Check if user has a pending join request
            const joinRequest = await prisma.joinRequest.findFirst({
                where: {
                    id: tripId,
                    senderId: userId
                }
            });

            if (joinRequest) {
                return NextResponse.json({
                    status: "REQUESTED",
                    message: "You have already requested to join this trip",
                    requestStatus: joinRequest.status
                });
            }

            // User has not requested to join
            return NextResponse.json({
                status: "NOT_REQUESTED",
                message: "You have not requested to join this trip"
            });
        }
    } catch (error) {
        console.error("Error fetching join requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch join requests" },
            { status: 500 }
        );
    }
}