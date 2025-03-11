// app/api/users/trips/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get trips for the current user (both created and joined)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to view your trips" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        // Get trips created by the user
        const createdTrips = await prisma.trip.findMany({
            where: {
                creatorId: userId
            },
            orderBy: {
                startDate: 'asc'
            },
            include: {
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
                creator: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true
                    }
                }
            }
        });

        // Get trips joined by the user
        const joinedTrips = await prisma.userTrip.findMany({
            where: {
                userId,
                // Exclude trips created by the user (already included in createdTrips)
                trip: {
                    creatorId: {
                        not: userId
                    }
                }
            },
            include: {
                trip: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true
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
                }
            },
            orderBy: {
                trip: {
                    startDate: 'asc'
                }
            }
        });

        // Get pending join requests
        const pendingRequests = await prisma.joinRequest.findMany({
            where: {
                senderId: userId,
                status: 'PENDING'
            },
            include: {
                trip: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format the data for the response
        const formattedCreatedTrips = createdTrips.map(trip => ({
            id: trip.id,
            title: trip.title,
            destination: trip.destination,
            startDate: trip.startDate,
            endDate: trip.endDate,
            status: trip.status,
            participantCount: trip.participants.length,
            maxParticipants: trip.maxParticipants,
            participants: trip.participants.map(p => p.user),
            creator: trip.creator,
            isCreator: true
        }));

        const formattedJoinedTrips = joinedTrips.map(userTrip => ({
            id: userTrip.trip.id,
            title: userTrip.trip.title,
            destination: userTrip.trip.destination,
            startDate: userTrip.trip.startDate,
            endDate: userTrip.trip.endDate,
            status: userTrip.trip.status,
            participantCount: userTrip.trip.participants.length,
            maxParticipants: userTrip.trip.maxParticipants,
            creator: userTrip.trip.creator,
            isCreator: false,
            joinedAt: userTrip.joinedAt
        }));

        const formattedPendingRequests = pendingRequests.map(request => ({
            id: request.id,
            tripId: request.trip.id,
            title: request.trip.title,
            destination: request.trip.destination,
            startDate: request.trip.startDate,
            endDate: request.trip.endDate,
            creator: request.trip.creator,
            status: request.status,
            createdAt: request.createdAt
        }));

        return NextResponse.json({
            created: formattedCreatedTrips,
            joined: formattedJoinedTrips,
            pendingRequests: formattedPendingRequests
        });
    } catch (error) {
        console.error("Error fetching user trips:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching your trips" },
            { status: 500 }
        );
    }
}