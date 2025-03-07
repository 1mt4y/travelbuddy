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
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to check join status" },
                { status: 401 }
            );
        }

        const tripId = (await context.params).id;
        const userId = session.user.id;

        // Check if user is already a participant
        const participant = await prisma.userTrip.findUnique({
            where: {
                userId_tripId: {
                    userId,
                    tripId
                }
            }
        });

        if (participant) {
            return NextResponse.json({
                status: "JOINED",
                message: "You are already a member of this trip"
            });
        }

        // Check for any join requests
        const joinRequest = await prisma.joinRequest.findFirst({
            where: {
                tripId,
                senderId: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!joinRequest) {
            return NextResponse.json({
                status: "NOT_REQUESTED",
                message: "You have not requested to join this trip"
            });
        }

        return NextResponse.json({
            status: joinRequest.status,
            message: joinRequest.status === "PENDING"
                ? "Your request is pending approval"
                : joinRequest.status === "ACCEPTED"
                    ? "Your request has been accepted"
                    : "Your request has been rejected",
            joinRequest
        });
    } catch (error) {
        console.error("Error checking join status:", error);
        return NextResponse.json(
            { error: "An error occurred while checking join status" },
            { status: 500 }
        );
    }
}