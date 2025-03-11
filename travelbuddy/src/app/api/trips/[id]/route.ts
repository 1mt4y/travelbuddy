// app/api/trips/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get a specific trip by ID
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const tripId = (await context.params).id;

        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        bio: true,
                        languages: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                },
                joinRequests: {
                    where: {
                        status: "PENDING"
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            }
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        const isCreator = trip.creatorId === session.user.id

        // Format the response data
        const formattedTrip = {
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            description: trip.description,
            activities: trip.activities,
            maxParticipants: trip.maxParticipants,
            status: trip.status,
            creator: trip.creator,
            isCreator: isCreator,
            participants: trip.participants.map(p => p.user),
            participantCount: trip.participants.length,
            joinRequests: trip.joinRequests,
            createdAt: trip.createdAt,
            updatedAt: trip.updatedAt
        };

        return NextResponse.json(formattedTrip);
    } catch (error) {
        console.error("Error fetching trip:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching the trip" },
            { status: 500 }
        );
    }
}

// Update a trip
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to update a trip" },
                { status: 401 }
            );
        }

        const tripId = (await context.params).id;
        const body = await request.json();

        const {
            title,
            destination,
            startDate,
            endDate,
            description,
            activities,
            maxParticipants,
            status,
            imageUrl,
        } = body;

        // Check if the trip exists
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

        // Check if the user is the creator of the trip
        if (trip.creatorId !== session.user.id) {
            return NextResponse.json(
                { error: "You are not authorized to update this trip" },
                { status: 403 }
            );
        }

        // Validate max participants against current participants
        if (maxParticipants && maxParticipants < trip.participants.length) {
            return NextResponse.json(
                { error: "Maximum participants cannot be less than current participants count" },
                { status: 400 }
            );
        }

        // Update the trip
        const updatedTrip = await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                title,
                destination,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                description,
                activities,
                maxParticipants,
                status,
                imageUrl,
            }
        });

        return NextResponse.json({
            trip: updatedTrip,
            message: "Trip updated successfully"
        });
    } catch (error) {
        console.error("Error updating trip:", error);
        return NextResponse.json(
            { error: "An error occurred while updating the trip" },
            { status: 500 }
        );
    }
}

// Delete a trip
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to delete a trip" },
                { status: 401 }
            );
        }

        const tripId = (await context.params).id;

        // Check if the trip exists
        const trip = await prisma.trip.findUnique({
            where: {
                id: tripId
            }
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        // Check if the user is the creator of the trip
        if (trip.creatorId !== session.user.id) {
            return NextResponse.json(
                { error: "You are not authorized to delete this trip" },
                { status: 403 }
            );
        }

        // Delete associated records first (to avoid foreign key constraints)
        await prisma.$transaction([
            // Delete join requests for this trip
            prisma.joinRequest.deleteMany({
                where: {
                    tripId
                }
            }),
            // Delete user trips associations
            prisma.userTrip.deleteMany({
                where: {
                    tripId
                }
            }),
            // Finally delete the trip
            prisma.trip.delete({
                where: {
                    id: tripId
                }
            })
        ]);

        return NextResponse.json({
            message: "Trip deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting trip:", error);
        return NextResponse.json(
            { error: "An error occurred while deleting the trip" },
            { status: 500 }
        );
    }
}

// Join request for a trip
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to request to join a trip" },
                { status: 401 }
            );
        }

        const tripId = (await context.params).id;
        const body = await request.json();
        const { message } = body;

        // Check if the trip exists
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

        // Check if the trip is open for join requests
        if (trip.status !== "OPEN") {
            return NextResponse.json(
                { error: "This trip is not open for new participants" },
                { status: 400 }
            );
        }

        // Check if the user is already a participant
        const isParticipant = trip.participants.some(
            p => p.userId === session.user.id
        );

        if (isParticipant) {
            return NextResponse.json(
                { error: "You are already a participant in this trip" },
                { status: 400 }
            );
        }

        // Check if user already has a pending request
        const existingRequest = await prisma.joinRequest.findFirst({
            where: {
                tripId,
                senderId: session.user.id,
                status: "PENDING"
            }
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "You already have a pending request for this trip" },
                { status: 400 }
            );
        }

        // Create the join request
        const joinRequest = await prisma.joinRequest.create({
            data: {
                message: message || "I would like to join this trip.",
                senderId: session.user.id,
                receiverId: trip.creatorId,
                tripId
            }
        });

        return NextResponse.json({
            joinRequest,
            message: "Join request sent successfully"
        });
    } catch (error) {
        console.error("Error creating join request:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the join request" },
            { status: 500 }
        );
    }
}