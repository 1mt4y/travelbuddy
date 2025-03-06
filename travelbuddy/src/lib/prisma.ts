import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a new PrismaClient if it doesn't exist on the global object
export const prisma = globalForPrisma.prisma || new PrismaClient();

// In development, attach the PrismaClient to the global object to prevent multiple instances
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;