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
        const tripId = (await context.params).id;
        const session = await getServerSession(authOptions);

        // Find the trip with creator and participants
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
                }
            }
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        // Check if the current user has requested to join this trip
        let userJoinRequest = null;
        if (session?.user) {
            userJoinRequest = await prisma.joinRequest.findFirst({
                where: {
                    tripId: trip.id,
                    senderId: session.user.id
                }
            });
        }

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
            participants: trip.participants.map(p => p.user),
            participantCount: trip.participants.length,
            userHasRequested: !!userJoinRequest,
            requestStatus: userJoinRequest?.status || null
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

// Join a trip (create a join request)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to join a trip" },
                { status: 401 }
            );
        }

        const tripId = params.id;
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

        // Check if the user has already sent a request
        const existingRequest = await prisma.joinRequest.findFirst({
            where: {
                tripId,
                senderId: session.user.id
            }
        });

        if (existingRequest) {
            return NextResponse.json(
                { error: "You have already sent a request to join this trip" },
                { status: 400 }
            );
        }

        // Create the join request
        const joinRequest = await prisma.joinRequest.create({
            data: {
                tripId,
                senderId: session.user.id,
                receiverId: trip.creatorId,
                message: message || "I'd like to join your trip!"
            }
        });

        return NextResponse.json({
            joinRequest,
            message: "Join request sent successfully"
        });
    } catch (error) {
        console.error("Error joining trip:", error);
        return NextResponse.json(
            { error: "An error occurred while sending join request" },
            { status: 500 }
        );
    }
}

// Update a trip (for the trip creator)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to update a trip" },
                { status: 401 }
            );
        }

        const tripId = params.id;
        const body = await request.json();

        // Check if trip exists and user is the creator
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

        if (trip.creatorId !== session.user.id) {
            return NextResponse.json(
                { error: "You are not authorized to update this trip" },
                { status: 403 }
            );
        }

        // Update the trip
        const updatedTrip = await prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                title: body.title,
                destination: body.destination,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                description: body.description,
                activities: body.activities,
                maxParticipants: body.maxParticipants,
                status: body.status
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

// Delete a trip (for the trip creator)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to delete a trip" },
                { status: 401 }
            );
        }

        const tripId = params.id;

        // Check if trip exists and user is the creator
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

        if (trip.creatorId !== session.user.id) {
            return NextResponse.json(
                { error: "You are not authorized to delete this trip" },
                { status: 403 }
            );
        }

        // Delete all join requests for this trip
        await prisma.joinRequest.deleteMany({
            where: {
                tripId
            }
        });

        // Delete all user-trip associations
        await prisma.userTrip.deleteMany({
            where: {
                tripId
            }
        });

        // Delete the trip
        await prisma.trip.delete({
            where: {
                id: tripId
            }
        });

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