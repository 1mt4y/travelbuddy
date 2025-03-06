// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Get a public profile for a user by ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const userId = (await context.params).id;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
                nationality: true,
                bio: true,
                languages: true,
                profileImage: true,
                createdAt: true,
                createdTrips: {
                    where: {
                        status: "OPEN",
                    },
                    select: {
                        id: true,
                        title: true,
                        destination: true,
                        startDate: true,
                        endDate: true,
                    },
                    take: 3,
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching the user profile" },
            { status: 500 }
        );
    }
}