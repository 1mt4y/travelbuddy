// app/api/trips/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Get all trips with filtering
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const destination = searchParams.get('destination');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build filter object
        const filter: any = {
            status: "OPEN",
        };

        if (destination) {
            filter.destination = {
                contains: destination,
                mode: 'insensitive'
            };
        }

        if (startDate) {
            filter.startDate = {
                gte: new Date(startDate)
            };
        }

        if (endDate) {
            filter.endDate = {
                lte: new Date(endDate)
            };
        }

        const trips = await prisma.trip.findMany({
            where: filter,
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
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Format the response data
        const formattedTrips = trips.map((trip: any) => ({
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
            participants: trip.participants.map((p: any) => p.user),
            participantCount: trip.participants.length
        }));

        return NextResponse.json(formattedTrips);
    } catch (error) {
        console.error("Error fetching trips:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching trips" },
            { status: 500 }
        );
    }
}

// Create a new trip
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to create a trip" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            destination,
            startDate,
            endDate,
            description,
            activities,
            maxParticipants
        } = body;

        // Create the trip
        const trip = await prisma.trip.create({
            data: {
                title,
                destination,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                description,
                activities,
                maxParticipants,
                creatorId: session.user.id
            }
        });

        // Add the creator as a participant
        await prisma.userTrip.create({
            data: {
                userId: session.user.id,
                tripId: trip.id
            }
        });

        return NextResponse.json({
            trip,
            message: "Trip created successfully"
        });
    } catch (error) {
        console.error("Error creating trip:", error);
        return NextResponse.json(
            { error: "An error occurred while creating the trip" },
            { status: 500 }
        );
    }
}