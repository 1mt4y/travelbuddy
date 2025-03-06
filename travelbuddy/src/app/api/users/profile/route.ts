// app/api/users/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get the current user's profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to view your profile" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Don't return the password
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "An error occurred while fetching your profile" },
            { status: 500 }
        );
    }
}

// Update the current user's profile
export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "You must be logged in to update your profile" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            name,
            dateOfBirth,
            nationality,
            bio,
            languages,
            profileImage,
        } = body;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                name,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                nationality,
                bio,
                languages,
                profileImage,
            },
        });

        // Don't return the password
        const { password, ...userWithoutPassword } = updatedUser;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "An error occurred while updating your profile" },
            { status: 500 }
        );
    }
}